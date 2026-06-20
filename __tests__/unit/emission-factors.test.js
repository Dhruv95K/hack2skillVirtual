import { calculateActivityCO2 } from '@/lib/co2-calculator';
describe('calculateActivityCO2', () => {
  it('car_petrol 100km = 17.1 kg CO2', () => {
    expect(calculateActivityCO2('transport', 'car_petrol', 100)).toBeCloseTo(17.1);
  });
  it('bicycle 100km = 0 kg CO2', () => {
    expect(calculateActivityCO2('transport', 'bicycle', 100)).toBe(0);
  });
  it('beef 1kg = 27 kg CO2', () => {
    expect(calculateActivityCO2('food', 'beef', 1)).toBe(27);
  });
  it('plant_based_meal 1 meal = 0.5 kg CO2', () => {
    expect(calculateActivityCO2('food', 'plant_based_meal', 1)).toBe(0.5);
  });
  it('electricity_india 100 kWh = 82 kg CO2', () => {
    expect(calculateActivityCO2('energy', 'electricity_india', 100)).toBeCloseTo(82);
  });
  it('throws for unknown subType', () => {
    expect(() => calculateActivityCO2('food', 'unknown_food', 1)).toThrow();
  });
});