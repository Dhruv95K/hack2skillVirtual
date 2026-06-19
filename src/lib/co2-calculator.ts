import { EMISSION_FACTORS } from './emission-factors';

export interface QuizAnswers {
  primary_transport: string;
  weekly_km: number;
  flights_per_year: number;
  diet_type: string;
  meat_meals_per_week: number;
  home_size?: string;
  monthly_electricity_kwh: number;
}

export interface BaselineResult {
  transport: number;
  food: number;
  energy: number;
  total: number;
}

export function calculateBaseline(answers: QuizAnswers): BaselineResult {
  const weeklyKm = assertFiniteQuizNumber(answers.weekly_km);
  const flightsPerYear = assertFiniteQuizNumber(answers.flights_per_year);
  const meatMealsPerWeek = assertFiniteQuizNumber(answers.meat_meals_per_week);
  const monthlyElectricityKwh = assertFiniteQuizNumber(answers.monthly_electricity_kwh);

  const transportFactor = EMISSION_FACTORS.transport[
    answers.primary_transport as keyof typeof EMISSION_FACTORS.transport
  ];

  if (transportFactor === undefined) {
    throw new Error('Unsupported transport type');
  }

  // Transport: weekly_km * 52 * factor
  const transport =
    weeklyKm * 52 * transportFactor +
    flightsPerYear * 1500 * EMISSION_FACTORS.transport.flight_short;
  
  // Food: meat meals * factor + non-meat meals * plant factor (52 weeks)
  const meatMealsPerYear = meatMealsPerWeek * 52;
  const plantMealsPerYear = (21 - meatMealsPerWeek) * 52;
  const food = meatMealsPerYear * EMISSION_FACTORS.food.meat_meal + plantMealsPerYear * EMISSION_FACTORS.food.plant_based_meal;
  
  // Energy: monthly kWh * 12 * India grid factor
  const energy = monthlyElectricityKwh * 12 * EMISSION_FACTORS.energy.electricity_india;
  
  const total = transport + food + energy;
  
  return {
    transport: +transport.toFixed(2),
    food: +food.toFixed(2),
    energy: +energy.toFixed(2),
    total: +total.toFixed(2),
  };
}

function assertFiniteQuizNumber(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('Invalid numeric quiz response');
  }

  return value;
}
