import { EMISSION_FACTORS } from './emission-factors';
import { assertQuizNumberInRange } from './quiz';
export function calculateBaseline(answers) {
  const weeklyKm = assertQuizNumberInRange('weekly_km', answers.weekly_km);
  const flightsPerYear = assertQuizNumberInRange('flights_per_year', answers.flights_per_year);
  const meatMealsPerWeek = assertQuizNumberInRange('meat_meals_per_week', answers.meat_meals_per_week);
  const monthlyElectricityKwh = assertQuizNumberInRange('monthly_electricity_kwh', answers.monthly_electricity_kwh);
  const transportFactor = EMISSION_FACTORS.transport[answers.primary_transport];
  if (transportFactor === undefined) {
    throw new Error('Unsupported transport type');
  }

  // Transport: weekly_km * 52 * factor
  const transport = weeklyKm * 52 * transportFactor + flightsPerYear * 1500 * EMISSION_FACTORS.transport.flight_short;

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
    total: +total.toFixed(2)
  };
}
export function calculateActivityCO2(category, subType, quantity) {
  const factors = EMISSION_FACTORS[category];
  if (!factors || !Object.prototype.hasOwnProperty.call(factors, subType)) {
    throw new Error(`Unknown sub-type: ${subType}`);
  }
  return +(quantity * factors[subType]).toFixed(3);
}