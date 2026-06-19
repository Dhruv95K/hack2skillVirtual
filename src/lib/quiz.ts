import type { QuizAnswers } from '@/lib/co2-calculator';

export const QUIZ_QUESTIONS = [
  {
    key: 'primary_transport',
    category: 'transport',
    question: 'What is your primary mode of daily transport?',
    type: 'select',
    options: [
      'car_petrol',
      'car_diesel',
      'car_electric',
      'bus',
      'train',
      'motorcycle',
      'bicycle',
      'walking',
    ],
  },
  {
    key: 'weekly_km',
    category: 'transport',
    question: 'How many km do you travel per week?',
    type: 'number',
    unit: 'km',
  },
  {
    key: 'flights_per_year',
    category: 'transport',
    question: 'How many flights do you take per year?',
    type: 'number',
    unit: 'flights',
  },
  {
    key: 'diet_type',
    category: 'food',
    question: 'How would you describe your diet?',
    type: 'select',
    options: ['vegan', 'vegetarian', 'pescatarian', 'meat_moderate', 'meat_heavy'],
  },
  {
    key: 'meat_meals_per_week',
    category: 'food',
    question: 'How many meat meals do you eat per week?',
    type: 'number',
    unit: 'meals',
  },
  {
    key: 'home_size',
    category: 'energy',
    question: 'What is your home size?',
    type: 'select',
    options: ['studio', '1bedroom', '2bedroom', '3bedroom', '4plus'],
  },
  {
    key: 'monthly_electricity_kwh',
    category: 'energy',
    question: 'Estimated monthly electricity use (kWh)?',
    type: 'number',
    unit: 'kWh',
  },
] as const;

export const QUIZ_STEPS = [
  { title: 'Transport', category: 'transport' },
  { title: 'Food', category: 'food' },
  { title: 'Energy', category: 'energy' },
] as const;

export const QUIZ_REQUIRED_RESPONSE_KEYS = [
  'primary_transport',
  'weekly_km',
  'flights_per_year',
  'diet_type',
  'meat_meals_per_week',
  'home_size',
  'monthly_electricity_kwh',
] as const;

export const QUIZ_SELECT_OPTIONS = {
  primary_transport: QUIZ_QUESTIONS[0].options,
  diet_type: QUIZ_QUESTIONS[3].options,
  home_size: QUIZ_QUESTIONS[5].options,
} as const;

export const QUIZ_NUMERIC_KEYS = [
  'weekly_km',
  'flights_per_year',
  'meat_meals_per_week',
  'monthly_electricity_kwh',
] as const;

export type QuizResponseKey = (typeof QUIZ_REQUIRED_RESPONSE_KEYS)[number];
export type QuizParsedResponses = QuizAnswers & {
  home_size: string;
};

export const QUIZ_QUESTION_CATEGORY_BY_KEY: Record<QuizResponseKey, string> = {
  primary_transport: 'transport',
  weekly_km: 'transport',
  flights_per_year: 'transport',
  diet_type: 'food',
  meat_meals_per_week: 'food',
  home_size: 'energy',
  monthly_electricity_kwh: 'energy',
};

export function parseQuizResponses(
  responses: unknown
):
  | { ok: true; data: QuizParsedResponses }
  | { ok: false; reason: 'missing' | 'invalid' } {
  if (!responses || typeof responses !== 'object') {
    return { ok: false, reason: 'missing' };
  }

  const rawResponses = responses as Record<string, unknown>;

  for (const key of QUIZ_REQUIRED_RESPONSE_KEYS) {
    const value = rawResponses[key];

    if (typeof value === 'string') {
      if (value.trim().length === 0) {
        return { ok: false, reason: 'missing' };
      }
      continue;
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        return { ok: false, reason: 'invalid' };
      }
      continue;
    }

    if (value == null) {
      return { ok: false, reason: 'missing' };
    }

    return { ok: false, reason: 'invalid' };
  }

  const primaryTransport = rawResponses.primary_transport;
  const dietType = rawResponses.diet_type;
  const homeSize = rawResponses.home_size;

  if (
    typeof primaryTransport !== 'string' ||
    !QUIZ_SELECT_OPTIONS.primary_transport.includes(
      primaryTransport as (typeof QUIZ_SELECT_OPTIONS.primary_transport)[number]
    ) ||
    typeof dietType !== 'string' ||
    !QUIZ_SELECT_OPTIONS.diet_type.includes(
      dietType as (typeof QUIZ_SELECT_OPTIONS.diet_type)[number]
    ) ||
    typeof homeSize !== 'string' ||
    !QUIZ_SELECT_OPTIONS.home_size.includes(
      homeSize as (typeof QUIZ_SELECT_OPTIONS.home_size)[number]
    )
  ) {
    return { ok: false, reason: 'invalid' };
  }

  const weeklyKm = parseQuizNumber(rawResponses.weekly_km);
  const flightsPerYear = parseQuizNumber(rawResponses.flights_per_year);
  const meatMealsPerWeek = parseQuizNumber(rawResponses.meat_meals_per_week);
  const monthlyElectricityKwh = parseQuizNumber(rawResponses.monthly_electricity_kwh);

  if (
    weeklyKm === null ||
    flightsPerYear === null ||
    meatMealsPerWeek === null ||
    monthlyElectricityKwh === null
  ) {
    return { ok: false, reason: 'invalid' };
  }

  return {
    ok: true,
    data: {
      primary_transport: primaryTransport,
      weekly_km: weeklyKm,
      flights_per_year: flightsPerYear,
      diet_type: dietType,
      meat_meals_per_week: meatMealsPerWeek,
      home_size: homeSize,
      monthly_electricity_kwh: monthlyElectricityKwh,
    },
  };
}

function parseQuizNumber(value: unknown): number | null {
  const normalized =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isFinite(normalized) || normalized < 0) {
    return null;
  }

  return normalized;
}
