import { describe, it, expect } from 'vitest';
import { HeatAssessmentService } from '../src/services/heatAssessmentService.js';
import { HourlyWeatherPoint } from '../src/types/index.js';

describe('HeatAssessmentService', () => {
  const basePoint: HourlyWeatherPoint = {
    time: '2026-10-11T10:00:00',
    hour: 10,
    temperature: 31,
    apparentTemperature: 34,
    relativeHumidity: 50,
    windSpeed: 12,
    solarRadiation: 450,
    isDaytime: true,
  };

  it('calculates lower relative concern under mild weather and light work', () => {
    const assessment = HeatAssessmentService.assessHour(basePoint, {
      workIntensity: 'light',
      shadeAvailability: 'good',
      workSetting: 'mixed_indoor_outdoor',
    });

    expect(assessment.heatStrainIndex).toBeLessThan(45);
    expect(assessment.category).toBe('lower_relative_concern');
    expect(assessment.primaryReasons.length).toBeGreaterThan(0);
  });

  it('elevates risk category when temperature and apparent heat increase', () => {
    const hotPoint: HourlyWeatherPoint = {
      ...basePoint,
      temperature: 39,
      apparentTemperature: 45,
      relativeHumidity: 65,
      solarRadiation: 920,
    };

    const assessment = HeatAssessmentService.assessHour(hotPoint, {
      workIntensity: 'heavy',
      shadeAvailability: 'limited',
      workSetting: 'mostly_exposed',
    });

    expect(assessment.heatStrainIndex).toBeGreaterThanOrEqual(75);
    expect(['high_caution', 'severe_heat_advisory']).toContain(assessment.category);
    expect(assessment.primaryReasons.some(r => r.includes('solar radiation'))).toBe(true);
  });

  it('modulates score based on shade availability', () => {
    const sunnyPoint: HourlyWeatherPoint = {
      ...basePoint,
      solarRadiation: 850,
    };

    const shadedAssessment = HeatAssessmentService.assessHour(sunnyPoint, {
      shadeAvailability: 'good',
    });

    const exposedAssessment = HeatAssessmentService.assessHour(sunnyPoint, {
      shadeAvailability: 'limited',
    });

    expect(exposedAssessment.heatStrainIndex).toBeGreaterThan(shadedAssessment.heatStrainIndex);
  });

  it('modulates score based on metabolic work intensity', () => {
    const lightAssessment = HeatAssessmentService.assessHour(basePoint, {
      workIntensity: 'light',
    });

    const heavyAssessment = HeatAssessmentService.assessHour(basePoint, {
      workIntensity: 'heavy',
    });

    expect(heavyAssessment.heatStrainIndex).toBeGreaterThan(lightAssessment.heatStrainIndex);
  });

  it('identifies best available work windows from timeline', () => {
    const timeline: HourlyWeatherPoint[] = [
      { time: 'T06:00', hour: 6, temperature: 27, apparentTemperature: 29, relativeHumidity: 80, windSpeed: 8, solarRadiation: 50 },
      { time: 'T07:00', hour: 7, temperature: 28, apparentTemperature: 30, relativeHumidity: 78, windSpeed: 9, solarRadiation: 150 },
      { time: 'T08:00', hour: 8, temperature: 30, apparentTemperature: 32, relativeHumidity: 74, windSpeed: 10, solarRadiation: 300 },
      { time: 'T12:00', hour: 12, temperature: 38, apparentTemperature: 44, relativeHumidity: 55, windSpeed: 14, solarRadiation: 900 },
      { time: 'T13:00', hour: 13, temperature: 39, apparentTemperature: 45, relativeHumidity: 53, windSpeed: 15, solarRadiation: 920 },
    ];

    const assessments = HeatAssessmentService.assessTimeline(timeline, { workIntensity: 'moderate' });
    const bestWindows = HeatAssessmentService.findBestWorkWindows(assessments);

    expect(bestWindows.length).toBeGreaterThan(0);
    expect(bestWindows[0].startTime).toBe('06:00');
    expect(bestWindows[0].durationHours).toBeGreaterThanOrEqual(2);
  });
});
