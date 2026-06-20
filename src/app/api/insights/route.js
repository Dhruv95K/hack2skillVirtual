/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
const systemPrompt = `You are EcoTrack's carbon reduction advisor. Analyze the user's carbon footprint data and provide exactly 3-5 actionable, personalized tips to reduce their CO2 emissions. Each tip must:
1. Be specific to their top-emitting category
2. Include an estimated CO2 saving (in kg)
3. Be practical and achievable in daily life
4. Be concise (2-3 sentences max)

Return ONLY a JSON array of tips in this format:
[{ "title": "...", "description": "...", "estimatedSavingKg": number, "category": "transport|food|energy" }]`;
const EMPTY_INSIGHTS_MESSAGE = 'Log some activities first to get personalized insights!';
const VALID_CATEGORIES = ['transport', 'food', 'energy'];
function isValidCategory(category) {
  return typeof category === 'string' && VALID_CATEGORIES.includes(category);
}
function roundSaving(value) {
  return Math.round(value * 10) / 10;
}
function normaliseTip(rawTip) {
  if (!rawTip || typeof rawTip !== 'object') {
    return null;
  }
  const candidate = rawTip;
  const title = typeof candidate.title === 'string' ? candidate.title.trim() : '';
  const description = typeof candidate.description === 'string' ? candidate.description.trim() : '';
  const estimatedSavingKg = candidate.estimatedSavingKg;
  const category = typeof candidate.category === 'string' ? candidate.category.trim().toLowerCase() : '';
  if (!title || !description || typeof estimatedSavingKg !== 'number' || !Number.isFinite(estimatedSavingKg) || estimatedSavingKg <= 0 || !isValidCategory(category)) {
    return null;
  }
  return {
    title,
    description,
    estimatedSavingKg: roundSaving(estimatedSavingKg),
    category
  };
}
function parseTipsFromResponse(responseText) {
  const trimmed = responseText.trim();
  const fenced = trimmed.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
  const arrayStart = fenced.indexOf('[');
  const arrayEnd = fenced.lastIndexOf(']');
  if (arrayStart === -1 || arrayEnd === -1 || arrayEnd < arrayStart) {
    throw new Error('Gemini response did not contain a JSON array.');
  }
  const parsed = JSON.parse(fenced.slice(arrayStart, arrayEnd + 1));
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini response was not an array.');
  }
  const tips = parsed.map(tip => normaliseTip(tip)).filter(tip => tip !== null);
  if (tips.length < 3 || tips.length > 5) {
    throw new Error('Gemini response must contain between 3 and 5 valid tips.');
  }
  return tips;
}
function buildUserSummary(logs) {
  const totals = logs.reduce((accumulator, log) => {
    const category = isValidCategory(log.category) ? log.category : 'transport';
    accumulator[category] += log.co2Kg;
    return accumulator;
  }, {
    transport: 0,
    food: 0,
    energy: 0
  });
  const categoriesByImpact = Object.entries(totals).sort(([, a], [, b]) => b - a);
  const topCategory = categoriesByImpact[0]?.[0] ?? 'transport';
  const recentActivityLines = logs.map(log => {
    const loggedDate = log.loggedAt.toISOString().split('T')[0];
    const subType = log.subType.replace(/_/g, ' ');
    return `- ${loggedDate}: ${log.category} / ${subType} / ${log.quantity} ${log.unit} / ${log.co2Kg.toFixed(1)} kg CO2`;
  });
  return {
    topCategory,
    prompt: [`Top-emitting category: ${topCategory}`, `Category totals: ${categoriesByImpact.map(([category, total]) => `${category}=${total.toFixed(1)} kg`).join(', ')}`, `Recent activity count: ${logs.length}`, 'Recent activities:', ...recentActivityLines].join('\n')
  };
}
function parseSavedTips(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.map(tip => normaliseTip(tip)).filter(tip => tip !== null).slice(0, 5);
}
async function getAuthenticatedUser(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const isE2E = process.env.E2E_AUTH_BYPASS_ENABLED === 'true' && cookieHeader.includes('e2e-mock-auth');
  if (isE2E) {
    return {
      id: 'e2e-user-id'
    };
  }
  const supabase = await createClient();
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();
  return user;
}
export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({
      error: 'Unauthorized'
    }, {
      status: 401
    });
  }
  try {
    const latestInsight = await prisma.aiInsight.findFirst({
      where: {
        userId: user.id
      },
      orderBy: {
        generatedAt: 'desc'
      }
    });
    if (!latestInsight) {
      const recentLogs = await prisma.activityLog.findMany({
        where: {
          userId: user.id
        },
        orderBy: {
          loggedAt: 'desc'
        },
        take: 1
      });
      return NextResponse.json({
        tips: [],
        generatedAt: null,
        message: recentLogs.length === 0 ? EMPTY_INSIGHTS_MESSAGE : 'Generate personalized tips from your latest activity logs.'
      });
    }
    return NextResponse.json({
      tips: parseSavedTips(latestInsight.content),
      generatedAt: latestInsight.generatedAt.toISOString()
    });
  } catch (error) {
    console.error('[insights] fetch_failed', {
      userId: user.id,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json({
      error: 'Unable to load insights right now.'
    }, {
      status: 500
    });
  }
}
export async function POST(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({
      error: 'Unauthorized'
    }, {
      status: 401
    });
  }
  const cookieHeader = request.headers.get('cookie') || '';
  const isE2E = process.env.E2E_AUTH_BYPASS_ENABLED === 'true' && cookieHeader.includes('e2e-mock-auth');
  try {
    if (isE2E) {
      return NextResponse.json({
        tips: [{
          title: "Mock Tip 1",
          description: "Use public transport.",
          estimatedSavingKg: 10,
          category: "transport"
        }, {
          title: "Mock Tip 2",
          description: "Eat plant based.",
          estimatedSavingKg: 5,
          category: "food"
        }],
        message: "Fresh AI insights generated."
      });
    }
    const recentLogs = await prisma.activityLog.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        loggedAt: 'desc'
      },
      take: 20
    });
    if (recentLogs.length === 0) {
      return NextResponse.json({
        tips: [],
        message: EMPTY_INSIGHTS_MESSAGE
      });
    }
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY');
    }
    const {
      prompt,
      topCategory
    } = buildUserSummary(recentLogs);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const tips = parseTipsFromResponse(text);
    await prisma.aiInsight.create({
      data: {
        userId: user.id,
        content: JSON.stringify(tips)
      }
    });
    console.info('[insights] generated', {
      userId: user.id,
      tipCount: tips.length,
      recentLogCount: recentLogs.length,
      topCategory
    });
    return NextResponse.json({
      tips
    });
  } catch (error) {
    console.error('[insights] generation_failed', {
      userId: user.id,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json({
      error: 'Unable to generate personalized insights right now.'
    }, {
      status: 500
    });
  }
}