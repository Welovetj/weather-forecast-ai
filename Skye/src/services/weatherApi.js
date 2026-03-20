import axios from 'axios';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT = 10000;
const MAX_FREE_TIER_DAYS = 16;
const DAY_MS = 24 * 60 * 60 * 1000;

const formatDateInput = (value, fieldName) => {
  if (!value) {
    throw new Error(`${fieldName} is required`);
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }

  throw new Error(`${fieldName} must be a valid date string or Date object`);
};

const toUtcMidnight = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

export const validateHistoricalDateRange = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) {
    throw new Error('Please select both From Date and To Date before fetching weather history.');
  }

  const fromUtc = toUtcMidnight(dateFrom);
  const toUtc = toUtcMidnight(dateTo);

  if (fromUtc == null || toUtc == null) {
    throw new Error('Please provide valid dates for both From Date and To Date.');
  }

  if (fromUtc > toUtc) {
    throw new Error('From Date cannot be after To Date.');
  }

  const inclusiveDays = Math.floor((toUtc - fromUtc) / DAY_MS) + 1;
  if (inclusiveDays > MAX_FREE_TIER_DAYS) {
    throw new Error('Date range cannot exceed 16 days on Open-Meteo free tier.');
  }
};

const mapWeatherCodeToCondition = (code) => {
  if (code === 0) return 'Clear';
  if (code >= 1 && code <= 3) return 'Cloudy';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
};

export const fetchHistoricalWeather = async (latitude, longitude, dateFrom, dateTo) => {
  if (typeof latitude !== 'number' || Number.isNaN(latitude)) {
    throw new Error('latitude must be a valid number');
  }

  if (typeof longitude !== 'number' || Number.isNaN(longitude)) {
    throw new Error('longitude must be a valid number');
  }

  validateHistoricalDateRange(dateFrom, dateTo);

  const startDate = formatDateInput(dateFrom, 'dateFrom');
  const endDate = formatDateInput(dateTo, 'dateTo');

  try {
    const response = await axios.get(OPEN_METEO_URL, {
      params: {
        latitude,
        longitude,
        start_date: startDate,
        end_date: endDate,
        daily: 'temperature_2m_max,temperature_2m_min,weathercode',
        timezone: 'auto',
      },
      timeout: REQUEST_TIMEOUT,
    });

    const daily = response?.data?.daily;
    const tempMaxList = daily?.temperature_2m_max;
    const tempMinList = daily?.temperature_2m_min;
    const weatherCodes = daily?.weathercode;

    const hasDailyData =
      Array.isArray(tempMaxList) &&
      Array.isArray(tempMinList) &&
      Array.isArray(weatherCodes) &&
      tempMaxList.length > 0 &&
      tempMinList.length > 0 &&
      weatherCodes.length > 0;

    if (!hasDailyData) {
      throw new Error('Historical weather data is empty for the selected range');
    }

    const temp_max = Math.max(...tempMaxList);
    const temp_min = Math.min(...tempMinList);

    // Use the most frequent weather code to represent the range-level condition.
    const codeFrequency = weatherCodes.reduce((acc, code) => {
      const key = String(code);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const dominantCode = Number(
      Object.keys(codeFrequency).sort((a, b) => codeFrequency[b] - codeFrequency[a])[0],
    );

    const condition = mapWeatherCodeToCondition(dominantCode);

    return {
      temp_min,
      temp_max,
      condition,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Historical weather data is empty')) {
      throw error;
    }

    const status = error?.response?.status;
    const details = error?.response?.data?.reason || error?.message;

    throw new Error(
      `Failed to fetch historical weather${status ? ` (status ${status})` : ''}${details ? `: ${details}` : ''}`,
    );
  }
};
