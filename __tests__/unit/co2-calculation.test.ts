import { calculateBaseline } from '@/lib/co2-calculator';

describe('calculateBaseline', () => {
  it('returns correct baseline for car user eating meat', () => {
    const responses = {
      primary_transport: 'car_petrol',
      weekly_km: 200,
      flights_per_year: 2,
      diet_type: 'meat_moderate',
      meat_meals_per_week: 5,
      monthly_electricity_kwh: 300,
    };
    const result = calculateBaseline(responses);
    expect(result.transport).toBeGreaterThan(0);
    expect(result.food).toBeGreaterThan(0);
    expect(result.energy).toBeGreaterThan(0);
    expect(result.total).toBe(result.transport + result.food + result.energy);
  });

  it('returns zero transport for walking commuter', () => {
    const responses = {
      primary_transport: 'walking',
      weekly_km: 5,
      flights_per_year: 0,
      diet_type: 'vegan',
      meat_meals_per_week: 0,
      monthly_electricity_kwh: 100,
    };
    const result = calculateBaseline(responses);
    expect(result.transport).toBeCloseTo(0);
  });

  it('calculates higher baseline for heavy meat eater vs vegan', () => {
    const meat = calculateBaseline({
      primary_transport: 'car_petrol',
      weekly_km: 100,
      flights_per_year: 0,
      diet_type: 'meat_heavy',
      meat_meals_per_week: 14,
      monthly_electricity_kwh: 200,
    });
    const vegan = calculateBaseline({
      primary_transport: 'car_petrol',
      weekly_km: 100,
      flights_per_year: 0,
      diet_type: 'vegan',
      meat_meals_per_week: 0,
      monthly_electricity_kwh: 200,
    });
    expect(meat.food).toBeGreaterThan(vegan.food);
  });

  it('throws when the transport mode is not supported', () => {
    expect(() =>
      calculateBaseline({
        primary_transport: 'spaceship',
        weekly_km: 100,
        flights_per_year: 0,
        diet_type: 'vegan',
        meat_meals_per_week: 0,
        monthly_electricity_kwh: 200,
      })
    ).toThrow('Unsupported transport type');
  });

  it('throws when a numeric response is not finite', () => {
    expect(() =>
      calculateBaseline({
        primary_transport: 'car_petrol',
        weekly_km: Number.NaN,
        flights_per_year: 0,
        diet_type: 'vegan',
        meat_meals_per_week: 0,
        monthly_electricity_kwh: 200,
      })
    ).toThrow('Invalid numeric quiz response');
  });
});
