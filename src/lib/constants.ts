export const ACTIVITY_SUB_TYPES = {
  transport: ['car_petrol','car_diesel','car_electric','bus','train','flight_short','flight_long','motorcycle','bicycle','walking'],
  food: ['beef','lamb','pork','chicken','fish','dairy','eggs','vegetables','plant_based_meal','meat_meal'],
  energy: ['electricity_india','electricity_uk','electricity_us','natural_gas','lpg','heating_oil'],
};

export const ACTIVITY_UNITS: Record<string, string> = {
  transport: 'km', food: 'kg', energy: 'kWh',
  natural_gas: 'm³', lpg: 'kg', heating_oil: 'litre',
  plant_based_meal: 'meals', meat_meal: 'meals',
};
