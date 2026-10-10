import { describe, it, expect } from 'vitest';
import { ShiftPlannerService } from '../src/services/shiftPlannerService.js';
import { getDeterministicDemoForecast } from '../src/data/demoScenario.js';
import { ShiftPlanRequest } from '../src/types/index.js';

describe('ShiftPlannerService', () => {
  const weather = getDeterministicDemoForecast('2026-10-11');

  const baseRequest: ShiftPlanRequest = {
    locationId: 'chennai',
    date: '2026-10-11',
    profileId: 'outdoor_maintenance',
    startTime: '09:00',
    endTime: '17:00',
    workIntensity: 'heavy',
    shadeAvailability: 'limited',
    workSetting: 'mostly_outdoors',
    breakPreferenceMinutes: 15,
    indoorTasksAvailable: true,
    shiftReschedulingAllowed: true,
  };

  it('generates a valid shift plan with no overlapping blocks', () => {
    const plan = ShiftPlannerService.generatePlan(baseRequest, weather);

    expect(plan).toBeDefined();
    expect(plan.schedule.length).toBeGreaterThan(0);
    expect(plan.summary.totalShiftHours).toBe(8);

    // Verify chronological order and no overlaps
    for (let i = 0; i < plan.schedule.length - 1; i++) {
      const current = plan.schedule[i];
      const next = plan.schedule[i + 1];

      const [curEndH, curEndM] = current.endTime.split(':').map(Number);
      const [nextStartH, nextStartM] = next.startTime.split(':').map(Number);

      const curEndTotal = curEndH * 60 + curEndM;
      const nextStartTotal = nextStartH * 60 + nextStartM;

      expect(curEndTotal).toBeLessThanOrEqual(nextStartTotal);
    }
  });

  it('strictly adheres to shift start and end boundaries', () => {
    const plan = ShiftPlannerService.generatePlan(
      { ...baseRequest, startTime: '07:30', endTime: '15:30' },
      weather
    );

    expect(plan.schedule[0].startTime).toBe('07:30');
    expect(plan.schedule[plan.schedule.length - 1].endTime).toBe('15:30');
  });

  it('rejects invalid shift hours where end is before or equal to start', () => {
    expect(() => {
      ShiftPlannerService.generatePlan(
        { ...baseRequest, startTime: '16:00', endTime: '10:00' },
        weather
      );
    }).toThrow('Shift end time must be after shift start time');
  });

  it('allocates indoor task alternatives when available during peak heat', () => {
    const planWithIndoor = ShiftPlannerService.generatePlan(
      { ...baseRequest, indoorTasksAvailable: true },
      weather
    );
    const planWithoutIndoor = ShiftPlannerService.generatePlan(
      { ...baseRequest, indoorTasksAvailable: false },
      weather
    );

    const hasIndoor = planWithIndoor.schedule.some(b => b.type === 'indoor_task_alternative');
    const hasNoIndoor = planWithoutIndoor.schedule.some(b => b.type === 'indoor_task_alternative');

    expect(hasIndoor).toBe(true);
    expect(hasNoIndoor).toBe(false);
    expect(planWithIndoor.summary.indoorWorkHours).toBeGreaterThan(0);
  });

  it('produces identical deterministic output for identical inputs', () => {
    const planA = ShiftPlannerService.generatePlan(baseRequest, weather);
    const planB = ShiftPlannerService.generatePlan(baseRequest, weather);

    expect(planA.schedule.map(s => s.startTime)).toEqual(planB.schedule.map(s => s.startTime));
    expect(planA.summary.overallRisk).toEqual(planB.summary.overallRisk);
    expect(planA.summary.peakHeatWindow).toEqual(planB.summary.peakHeatWindow);
  });
});
