export const CHART_COLORS = {
  temperature: 'rgb(255, 99, 132)',
  humidity: 'rgb(53, 162, 235)',
  light: 'rgb(255, 205, 86)',
  airQuality: 'rgb(75, 192, 192)',
  gas: 'rgb(153, 102, 255)',
  smoke: 'rgb(255, 159, 64)'
};

export const SENSOR_UNITS = {
  temperature: '°C',
  humidity: '%',
  light: 'lux',
  airQuality: 'AQI',
  gas: 'ppm',
  smoke: 'ppm'
};

export const ROOMS = {
  LIVING_ROOM: {
    id: 'living-room',
    name: 'Living Room',
    sensors: ['temperature', 'humidity', 'light', 'air-quality'],
    devices: ['light', 'fan', 'air-conditioner']
  },
  BEDROOM_1: {
    id: 'bedroom-1',
    name: 'Bedroom 1',
    sensors: ['temperature', 'humidity', 'light'],
    devices: ['light', 'fan']
  },
  BEDROOM_2: {
    id: 'bedroom-2',
    name: 'Bedroom 2',
    sensors: ['temperature', 'humidity', 'light'],
    devices: ['light', 'fan']
  },
  KITCHEN: {
    id: 'kitchen',
    name: 'Kitchen',
    sensors: ['temperature', 'humidity', 'gas', 'smoke'],
    devices: ['light', 'fan', 'exhaust-fan']
  }
};

export const LIGHT_STANDARDS = {
  LIVING_ROOM: {
    min: 150,
    max: 300,
    description: 'Living rooms need moderate lighting for comfort and activities like watching TV or reading'
  },
  BEDROOM_1: {
    min: 100,
    max: 200,
    description: 'Bedrooms require softer lighting for relaxation and rest'
  },
  BEDROOM_2: {
    min: 100,
    max: 200,
    description: 'Bedrooms require softer lighting for relaxation and rest'
  },
  KITCHEN: {
    min: 300,
    max: 750,
    description: 'Kitchens need bright lighting for food preparation and cooking safety'
  }
};

export const SENSOR_THRESHOLDS = {
  LIVING_ROOM: {
    temperature: { min: 20, max: 26, warning: 28, critical: 30 },
    humidity: { min: 30, max: 60, warning: 70, critical: 80 },
    airQuality: { good: 0, moderate: 50, poor: 100, critical: 150 }
  },
  BEDROOM_1: {
    temperature: { min: 18, max: 24, warning: 26, critical: 28 },
    humidity: { min: 30, max: 60, warning: 70, critical: 80 }
  },
  BEDROOM_2: {
    temperature: { min: 18, max: 24, warning: 26, critical: 28 },
    humidity: { min: 30, max: 60, warning: 70, critical: 80 }
  },
  KITCHEN: {
    temperature: { min: 20, max: 27, warning: 30, critical: 32 },
    humidity: { min: 30, max: 60, warning: 70, critical: 80 },
    gas: { safe: 0, warning: 50, danger: 70, critical: 100 },
    smoke: { safe: 0, warning: 50, danger: 70, critical: 100 }
  }
};

export const DEVICE_SETTINGS = {
  light: {
    type: 'dimmer',
    levels: [0, 25, 50, 75, 100],
    defaultLevel: 50,
    unit: '%'
  },
  fan: {
    type: 'speed',
    levels: [0, 1, 2, 3],
    defaultLevel: 1,
    unit: 'speed'
  },
  'air-conditioner': {
    type: 'temperature',
    range: { min: 16, max: 30 },
    defaultTemp: 24,
    modes: ['cool', 'heat', 'auto'],
    defaultMode: 'auto',
    unit: '°C'
  },
  'exhaust-fan': {
    type: 'speed',
    levels: [0, 1, 2],
    defaultLevel: 1,
    unit: 'speed'
  }
};

export const SENSOR_ADVICE = {
  temperature: {
    tooLow: 'Temperature is too low. Consider increasing heating.',
    tooHigh: 'Temperature is too high. Consider cooling measures.',
    optimal: 'Temperature is within comfortable range.'
  },
  humidity: {
    tooLow: 'Humidity is too low. Consider using a humidifier.',
    tooHigh: 'Humidity is too high. Consider dehumidification.',
    optimal: 'Humidity is within comfortable range.'
  },
  light: {
    tooLow: 'Light level is too low for this room type.',
    tooHigh: 'Light level is too high. Consider reducing brightness.',
    optimal: 'Light level is appropriate for this room.'
  },
  gas: {
    safe: 'Gas levels are safe.',
    warning: 'Gas levels are elevated. Check ventilation.',
    danger: 'WARNING: High gas levels detected! Open windows immediately!'
  },
  smoke: {
    safe: 'No smoke detected.',
    warning: 'Smoke levels are elevated. Check for sources.',
    danger: 'WARNING: High smoke levels detected! Check for fire!'
  },
  airQuality: {
    good: 'Air quality is good.',
    moderate: 'Air quality is moderate. Consider ventilation.',
    poor: 'Poor air quality. Increase ventilation.'
  }
};