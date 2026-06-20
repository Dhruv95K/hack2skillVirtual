import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateBaseline } from '@/lib/co2-calculator';
import { parseQuizResponses, QUIZ_QUESTION_CATEGORY_BY_KEY, QUIZ_REQUIRED_RESPONSE_KEYS } from '@/lib/quiz';
export async function POST(request) {
  const requestId = crypto.randomUUID();
  const isE2EAuthBypassEnabled = process.env.E2E_AUTH_BYPASS_ENABLED === 'true';
  const isE2E = isE2EAuthBypassEnabled && request.cookies.has('e2e-mock-auth');
  const isE2EQuizComplete = isE2EAuthBypassEnabled && request.cookies.has('e2e-quiz-complete');
  try {
    if (isE2EQuizComplete) {
      return jsonWithRequestId({
        error: 'Quiz already completed'
      }, 409, requestId);
    }
    let userId = 'e2e-user';
    if (!isE2E) {
      const supabase = await createClient();
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        return jsonWithRequestId({
          error: 'Unauthorized'
        }, 401, requestId);
      }
      userId = user.id;
    }
    const body = await request.json().catch(() => null);
    const parsedResponses = parseQuizResponses(body?.responses);
    if (!parsedResponses.ok && parsedResponses.reason === 'missing') {
      console.warn('[quiz] rejected incomplete submission', {
        requestId,
        providedKeys: body?.responses && typeof body.responses === 'object' ? Object.keys(body.responses) : []
      });
      return jsonWithRequestId({
        error: 'Missing required quiz responses'
      }, 422, requestId);
    }
    if (!parsedResponses.ok) {
      console.warn('[quiz] rejected invalid submission', {
        requestId
      });
      return jsonWithRequestId({
        error: 'Invalid quiz response values'
      }, 422, requestId);
    }
    const existingResponsesCount = isE2E ? 0 : await prisma.quizResponse.count({
      where: {
        userId
      }
    });
    if (existingResponsesCount > 0) {
      console.info('[quiz] duplicate submission ignored', {
        requestId
      });
      return jsonWithRequestId({
        error: 'Quiz already completed'
      }, 409, requestId);
    }
    const baseline = calculateBaseline(parsedResponses.data);
    if (!isE2E) {
      await prisma.$transaction(async tx => {
        await tx.quizResponse.createMany({
          data: QUIZ_REQUIRED_RESPONSE_KEYS.map(key => ({
            userId,
            category: QUIZ_QUESTION_CATEGORY_BY_KEY[key],
            questionKey: key,
            answer: String(parsedResponses.data[key])
          }))
        });
        await tx.user.update({
          where: {
            id: userId
          },
          data: {
            totalCo2Tracked: 0
          }
        });
      });
    }
    console.info('[quiz] baseline saved', {
      requestId,
      questionCount: QUIZ_REQUIRED_RESPONSE_KEYS.length,
      baselineTotalKg: baseline.total
    });
    return jsonWithRequestId({
      success: true,
      baseline
    }, 200, requestId, isE2E);
  } catch (error) {
    if (isQuizAlreadyCompletedError(error)) {
      console.info('[quiz] duplicate submission lost write race', {
        requestId
      });
      return jsonWithRequestId({
        error: 'Quiz already completed'
      }, 409, requestId);
    }
    console.error('[quiz] submission failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return jsonWithRequestId({
      error: 'Failed to save quiz responses'
    }, 500, requestId);
  }
}
function jsonWithRequestId(body, status, requestId, markE2EComplete = false) {
  const response = NextResponse.json(body, {
    status,
    headers: {
      'x-request-id': requestId
    }
  });
  if (markE2EComplete) {
    response.cookies.set('e2e-quiz-complete', 'true', {
      httpOnly: false,
      path: '/',
      sameSite: 'lax'
    });
  }
  return response;
}
function isQuizAlreadyCompletedError(error) {
  return error instanceof Prisma.PrismaClientKnownRequestError ? error.code === 'P2002' : typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}