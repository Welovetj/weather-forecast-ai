import { describe, it, expect } from 'vitest';
import {
  formatTemp,
  formatTime,
  formatDate,
  getWindDirection,
  getWeatherIconUrl,
} from '../api/weatherApi';

describe('formatTemp', () => {
  it('formats metric temperature with °C', () => {
    expect(formatTemp(20.7, 'metric')).toBe('21°C');
  });

  it('formats imperial temperature with °F', () => {
    expect(formatTemp(72.3, 'imperial')).toBe('72°F');
  });

  it('formats standard temperature with K', () => {
    expect(formatTemp(293, 'standard')).toBe('293K');
  });

  it('rounds temperature to nearest integer', () => {
    expect(formatTemp(-5.5, 'metric')).toBe('-5°C'); // JS Math.round rounds toward +∞
  });
});

describe('getWindDirection', () => {
  it('returns N for 0 degrees', () => {
    expect(getWindDirection(0)).toBe('N');
  });

  it('returns E for 90 degrees', () => {
    expect(getWindDirection(90)).toBe('E');
  });

  it('returns S for 180 degrees', () => {
    expect(getWindDirection(180)).toBe('S');
  });

  it('returns W for 270 degrees', () => {
    expect(getWindDirection(270)).toBe('W');
  });

  it('returns NE for 45 degrees', () => {
    expect(getWindDirection(45)).toBe('NE');
  });
});

describe('getWeatherIconUrl', () => {
  it('returns a valid OpenWeatherMap icon URL', () => {
    const url = getWeatherIconUrl('01d');
    expect(url).toBe('https://openweathermap.org/img/wn/01d@2x.png');
  });
});

describe('formatDate', () => {
  it('returns a formatted date string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('Mon');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });
});

describe('formatTime', () => {
  it('returns a time string in HH:MM format', () => {
    // Unix 1700000000 = 2023-11-14 22:13:20 UTC, timezone offset 0
    const result = formatTime(1700000000, 0);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});
