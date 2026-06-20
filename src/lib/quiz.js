export const QUIZ_NUMERIC_CONSTRAINTS = {
  weekly_km: {
    min: 0,
    max: 5000,
    step: 1,
    integerOnly: true
  },
  flights_per_year: {
    min: 0,
    max: 100,
    step: 1,
    integerOnly: true
  },
  meat_meals_per_week: {
    min: 0,
    max: 21,
    step: 1,
    integerOnly: true
  },
  monthly_electricity_kwh: {
    min: 0,
    max: 5000,
    step: 1,
    integerOnly: true
  }
};
export const QUIZ_QUESTIONS = [{
  key: 'primary_transport',
  category: 'transport',
  question: 'What is your primary mode of daily transport?',
  type: 'select',
  options: ['car_petrol', 'car_diesel', 'car_electric', 'bus', 'train', 'motorcycle', 'bicycle', 'walking']
}, {
  key: 'weekly_km',
  category: 'transport',
  question: 'How many km do you travel per week?',
  type: 'number',
  unit: 'km',
  ...QUIZ_NUMERIC_CONSTRAINTS.weekly_km
}, {
  key: 'flights_per_year',
  category: 'transport',
  question: 'How many flights do you take per year?',
  type: 'number',
  unit: 'flights',
  ...QUIZ_NUMERIC_CONSTRAINTS.flights_per_year
}, {
  key: 'diet_type',
  category: 'food',
  question: 'How would you describe your diet?',
  type: 'select',
  options: ['vegan', 'vegetarian', 'pescatarian', 'meat_moderate', 'meat_heavy']
}, {
  key: 'meat_meals_per_week',
  category: 'food',
  question: 'How many meat meals do you eat per week?',
  type: 'number',
  unit: 'meals',
  ...QUIZ_NUMERIC_CONSTRAINTS.meat_meals_per_week
}, {
  key: 'home_size',
  category: 'energy',
  question: 'What is your home size?',
  type: 'select',
  options: ['studio', '1bedroom', '2bedroom', '3bedroom', '4plus']
}, {
  key: 'monthly_electricity_kwh',
  category: 'energy',
  question: 'Estimated monthly electricity use (kWh)?',
  type: 'number',
  unit: 'kWh',
  ...QUIZ_NUMERIC_CONSTRAINTS.monthly_electricity_kwh
}];
export const QUIZ_STEPS = [{
  title: 'Transport',
  category: 'transport'
}, {
  title: 'Food',
  category: 'food'
}, {
  title: 'Energy',
  category: 'energy'
}];
export const QUIZ_REQUIRED_RESPONSE_KEYS = ['primary_transport', 'weekly_km', 'flights_per_year', 'diet_type', 'meat_meals_per_week', 'home_size', 'monthly_electricity_kwh'];
export const QUIZ_SELECT_OPTIONS = {
  primary_transport: getSelectQuestion('primary_transport').options,
  diet_type: getSelectQuestion('diet_type').options,
  home_size: getSelectQuestion('home_size').options
};
export const QUIZ_QUESTION_CATEGORY_BY_KEY = {
  primary_transport: 'transport',
  weekly_km: 'transport',
  flights_per_year: 'transport',
  diet_type: 'food',
  meat_meals_per_week: 'food',
  home_size: 'energy',
  monthly_electricity_kwh: 'energy'
};
export function parseQuizResponses(responses) {
  if (!responses || typeof responses !== 'object') {
    return {
      ok: false,
      reason: 'missing'
    };
  }
  const rawResponses = responses;
  for (const key of QUIZ_REQUIRED_RESPONSE_KEYS) {
    const value = rawResponses[key];
    if (value == null) {
      return {
        ok: false,
        reason: 'missing'
      };
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      return {
        ok: false,
        reason: 'missing'
      };
    }
  }
  const primaryTransport = parseSelectAnswer('primary_transport', rawResponses.primary_transport);
  const dietType = parseSelectAnswer('diet_type', rawResponses.diet_type);
  const homeSize = parseSelectAnswer('home_size', rawResponses.home_size);
  const weeklyKm = parseQuizNumber('weekly_km', rawResponses.weekly_km);
  const flightsPerYear = parseQuizNumber('flights_per_year', rawResponses.flights_per_year);
  const meatMealsPerWeek = parseQuizNumber('meat_meals_per_week', rawResponses.meat_meals_per_week);
  const monthlyElectricityKwh = parseQuizNumber('monthly_electricity_kwh', rawResponses.monthly_electricity_kwh);
  if (primaryTransport === null || dietType === null || homeSize === null || weeklyKm === null || flightsPerYear === null || meatMealsPerWeek === null || monthlyElectricityKwh === null) {
    return {
      ok: false,
      reason: 'invalid'
    };
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
      monthly_electricity_kwh: monthlyElectricityKwh
    }
  };
}
export function assertQuizNumberInRange(key, value) {
  const constraints = QUIZ_NUMERIC_CONSTRAINTS[key];
  if (!Number.isFinite(value) || value < constraints.min || value > constraints.max) {
    throw new Error(`Invalid numeric quiz response for ${key}`);
  }
  if (constraints.integerOnly && !Number.isInteger(value)) {
    throw new Error(`Invalid numeric quiz response for ${key}`);
  }
  return value;
}
function getSelectQuestion(key) {
  return QUIZ_QUESTIONS.find(question => question.key === key && question.type === 'select');
}
function parseSelectAnswer(key, value) {
  if (typeof value !== 'string') {
    return null;
  }
  return QUIZ_SELECT_OPTIONS[key].includes(value) ? value : null;
}
function parseQuizNumber(key, value) {
  const normalized = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  try {
    return assertQuizNumberInRange(key, normalized);
  } catch {
    return null;
  }
}