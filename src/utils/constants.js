export const CHART_COLORS = {
  temperature: 'rgb(255, 99, 132)',
  humidity: 'rgb(54, 162, 235)',
  light: 'rgb(255, 206, 86)',
  gas: 'rgb(75, 192, 192)'
};

export const SENSOR_UNITS = {
  temperature: '°C',
  humidity: '%',
  light: 'lux',
  airQuality: 'ppm',
  gas: 'ppm'
};

export const ROOMS = {
  LIVING_ROOM: {
    id: 'living-room',
    name: 'Living Room',
    sensors: ['temperature', 'humidity', 'light', 'air-quality'],
    devices: ['light', 'fan', 'air-conditioner']
  },
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
    temperature: { min: 18, max: 30 },
    humidity: { min: 30, max: 70 },
    light: { min: 300, max: 500 }, // Tiêu chuẩn ánh sáng phòng khách (lux)
    gas: { min: 0, max: 5000 } // ppm
  },
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
    danger: 'WARNING: High smokWe levels detected! Check for fire!'
  },
  airQuality: {
    good: 'Air quality is good.',
    moderate: 'Air quality is moderate. Consider ventilation.',
    poor: 'Poor air quality. Increase ventilation.'
  }
};

// Add warning messages
export const WARNING_MESSAGES = {
  LIGHT: {
    LOW: "Ánh sáng quá thấp (< 300 lux). Bạn nên bật đèn!",
    HIGH: "Ánh sáng quá cao (> 1000 lux). Bạn có thể tắt đèn để tiết kiệm điện!",
  },
  GAS: {
    DANGER: "DANGER: Gas concentration is at dangerous level! Please ventilate immediately!",
    WARNING: "Warning: Gas level is rising above safe threshold!"
  }
};