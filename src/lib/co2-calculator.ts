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
  // Transport: weekly_km * 52 * factor
  const transportFactor = EMISSION_FACTORS.transport[answers.primary_transport as keyof typeof EMISSION_FACTORS.transport] ?? 0;
  const transport = answers.weekly_km * 52 * transportFactor + answers.flights_per_year * 1500 * EMISSION_FACTORS.transport.flight_short;
  
  // Food: meat meals * factor + non-meat meals * plant factor (52 weeks)
  const meatMealsPerYear = answers.meat_meals_per_week * 52;
  const plantMealsPerYear = (21 - answers.meat_meals_per_week) * 52;
  const food = meatMealsPerYear * EMISSION_FACTORS.food.meat_meal + plantMealsPerYear * EMISSION_FACTORS.food.plant_based_meal;
  
  // Energy: monthly kWh * 12 * India grid factor
  const energy = answers.monthly_electricity_kwh * 12 * EMISSION_FACTORS.energy.electricity_india;
  
  const total = transport + food + energy;
  
  return {
    transport: +transport.toFixed(2),
    food: +food.toFixed(2),
    energy: +energy.toFixed(2),
    total: +total.toFixed(2),
  };
}
