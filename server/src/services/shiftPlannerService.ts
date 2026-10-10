import {
  ShiftPlanRequest,
  ShiftPlan,
  HourlyWeatherPoint,
  ScheduleBlock,
  RiskCategory,
} from '../types/index.js';
import { HeatAssessmentService } from './heatAssessmentService.js';
import { SUPPORTED_LOCATIONS, WORKER_PROFILES } from '../data/demoScenario.js';

export class ShiftPlannerService {
  /**
   * Generates a deterministic, climate-adaptive shift plan based on weather and crew settings.
   */
  public static generatePlan(
    request: ShiftPlanRequest,
    hourlyWeather: HourlyWeatherPoint[],
    isSimulatedData = false,
    dataSourceLabel = 'Forecast'
  ): ShiftPlan {
    // 1. Validation
    const startHourNum = parseInt(request.startTime.split(':')[0], 10);
    const startMinNum = parseInt(request.startTime.split(':')[1] || '0', 10);
    const endHourNum = parseInt(request.endTime.split(':')[0], 10);
    const endMinNum = parseInt(request.endTime.split(':')[1] || '0', 10);

    const startMinutes = startHourNum * 60 + startMinNum;
    const endMinutes = endHourNum * 60 + endMinNum;

    if (isNaN(startMinutes) || isNaN(endMinutes) || endMinutes <= startMinutes) {
      throw new Error('Invalid shift duration: Shift end time must be after shift start time.');
    }

    const durationHours = (endMinutes - startMinutes) / 60;
    if (durationHours < 1 || durationHours > 16) {
      throw new Error('Shift duration must be between 1 and 16 hours.');
    }

    const loc = SUPPORTED_LOCATIONS.find(l => l.id.toLowerCase() === request.locationId.toLowerCase()) 
      || SUPPORTED_LOCATIONS[0];
    const profile = WORKER_PROFILES.find(p => p.id === request.profileId) || WORKER_PROFILES[0];

    // 2. Assess full hourly weather under worksite settings
    const fullAssessments = HeatAssessmentService.assessTimeline(hourlyWeather, {
      workIntensity: request.workIntensity,
      shadeAvailability: request.shadeAvailability,
      workSetting: request.workSetting,
    });

    // 3. Filter assessments overlapping shift hours
    const shiftAssessments = fullAssessments.filter(
      a => a.hour >= startHourNum && a.hour < Math.ceil(endHourNum + endMinNum / 60)
    );

    // Identify peak heat window
    let maxTemp = 0;
    let maxAppTemp = 0;
    let worstCategory: RiskCategory = 'lower_relative_concern';
    let peakHour = startHourNum;

    for (const a of shiftAssessments) {
      if (a.temperature > maxTemp) maxTemp = a.temperature;
      if (a.apparentTemperature > maxAppTemp) {
        maxAppTemp = a.apparentTemperature;
        peakHour = a.hour;
      }
      if (a.category === 'severe_heat_advisory') worstCategory = 'severe_heat_advisory';
      else if (a.category === 'high_caution' && worstCategory !== 'severe_heat_advisory') worstCategory = 'high_caution';
      else if (a.category === 'elevated_caution' && worstCategory === 'lower_relative_concern') worstCategory = 'elevated_caution';
    }

    const peakHeatWindow = `${peakHour.toString().padStart(2, '0')}:00 – ${(peakHour + 2).toString().padStart(2, '0')}:00`;

    // 4. Generate Structured Sequential Blocks
    const schedule: ScheduleBlock[] = [];
    let currentMin = startMinutes;
    let blockIdCounter = 1;

    // Helper: format minutes to HH:MM
    const fmt = (m: number) => {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      return `${h}:${min}`;
    };

    // Initial Crew Briefing (15 min)
    const briefingEnd = Math.min(endMinutes, currentMin + 15);
    schedule.push({
      id: `block-${blockIdCounter++}`,
      startTime: fmt(currentMin),
      endTime: fmt(briefingEnd),
      type: 'shift_briefing',
      title: 'Crew Heat Safety Briefing & Readiness Check',
      description: 'Review forecast temperature progression, designate shade areas, confirm chilled water availability, and assign buddy pairs.',
      locationContext: 'shaded_area',
      riskCategory: 'lower_relative_concern',
      guidance: 'Ensure all team members drink 350-500ml water prior to commencing work.',
    });
    currentMin = briefingEnd;

    // Identify peak heat window in minutes
    // Typically 11:30 (690m) to 14:30 (870m) or centered around peakHour
    const peakStartMin = Math.max(startMinutes, (peakHour - 1) * 60);
    const peakEndMin = Math.min(endMinutes, (peakHour + 2) * 60);

    // Morning segment before peak heat
    if (currentMin < peakStartMin) {
      // Work segment until 30 min before peak or until halfway
      const morningMid = Math.floor((currentMin + peakStartMin) / 2);

      // Morning Block 1: Core Outdoor Work (comparatively favourable)
      schedule.push({
        id: `block-${blockIdCounter++}`,
        startTime: fmt(currentMin),
        endTime: fmt(morningMid),
        type: 'core_outdoor_work',
        title: 'Primary Outdoor Work Window (Favourable Conditions)',
        description: `Execute high-exertion duties for ${profile.title}. Air temperature is moderate before solar intensity peaks.`,
        locationContext: 'outdoor',
        riskCategory: 'lower_relative_concern',
        guidance: 'Prioritize physical assembly, digging, lifting, or major field transit during this window.',
      });
      currentMin = morningMid;

      // Morning Hydration Rest Break (15 min)
      const restDuration = Math.min(request.breakPreferenceMinutes || 15, 20);
      const breakEnd = Math.min(peakStartMin, currentMin + restDuration);
      schedule.push({
        id: `block-${blockIdCounter++}`,
        startTime: fmt(currentMin),
        endTime: fmt(breakEnd),
        type: 'hydration_rest_break',
        title: 'Mid-Morning Hydration & Active Cooling',
        description: 'Mandatory rest in shaded canopy. Fluid replenishment and electrolyte check.',
        locationContext: 'shaded_area',
        riskCategory: 'lower_relative_concern',
        guidance: 'Supervisor confirms shade access and observes crew exertion pace.',
      });
      currentMin = breakEnd;

      // Second Morning block leading into peak heat checkpoint
      if (currentMin < peakStartMin) {
        schedule.push({
          id: `block-${blockIdCounter++}`,
          startTime: fmt(currentMin),
          endTime: fmt(peakStartMin),
          type: 'core_outdoor_work',
          title: 'Secondary Outdoor Work & Pre-Peak Wrap-up',
          description: 'Transition active outdoor stations; secure tools in preparation for midday heat adaptation.',
          locationContext: 'outdoor',
          riskCategory: 'elevated_caution',
          guidance: 'Temperatures rising toward midday threshold. Maintain steady physical pacing.',
        });
        currentMin = peakStartMin;
      }
    }

    // Midday Peak Heat Checkpoint (15 min)
    if (currentMin < peakEndMin && currentMin < endMinutes) {
      const checkEnd = Math.min(endMinutes, currentMin + 15);
      schedule.push({
        id: `block-${blockIdCounter++}`,
        startTime: fmt(currentMin),
        endTime: fmt(checkEnd),
        type: 'heat_review_checkpoint',
        title: 'Midday Heat Outlook Review & Task Reassessment',
        description: `Peak solar irradiance and forecast heat index (~${maxAppTemp}°C). Assess crew fatigue and review symptom checklist.`,
        locationContext: 'shaded_area',
        riskCategory: worstCategory,
        guidance: 'Strict halt on unshaded heavy exertion. Verify shade and cold water supply.',
      });
      currentMin = checkEnd;

      // Midday Peak Period: Indoor alternative OR Shaded Split Shift
      const middayEnd = Math.min(endMinutes, peakEndMin);
      if (currentMin < middayEnd) {
        if (request.indoorTasksAvailable) {
          // Indoor alternative
          schedule.push({
            id: `block-${blockIdCounter++}`,
            startTime: fmt(currentMin),
            endTime: fmt(middayEnd),
            type: 'indoor_task_alternative',
            title: 'Indoor Task Shift: Material Staging & Equipment Prep',
            description: 'Relocate work indoors to shaded/ventilated bay. Carry out sorting, tool servicing, reporting, or fabrication.',
            locationContext: 'indoor',
            riskCategory: 'lower_relative_concern',
            guidance: 'Protects workforce from direct solar radiation during the day\'s most demanding ambient window.',
          });
        } else {
          // Heavily mitigated shaded outdoor work with frequent rotation
          schedule.push({
            id: `block-${blockIdCounter++}`,
            startTime: fmt(currentMin),
            endTime: fmt(middayEnd),
            type: 'core_outdoor_work',
            title: 'Paced Shaded Maintenance / Rotational Duties',
            description: 'Lightened workload in canopied or shaded perimeter. Rotate workers every 20-30 minutes.',
            locationContext: request.shadeAvailability === 'good' ? 'shaded_area' : 'outdoor',
            riskCategory: worstCategory,
            guidance: 'Heavy exertion strongly discouraged. Provide personal misting or fan ventilation if available.',
          });
        }
        currentMin = middayEnd;
      }

      // Midday Rest / Meal Break (30 min)
      if (currentMin < endMinutes) {
        const mealDuration = 30;
        const mealEnd = Math.min(endMinutes, currentMin + mealDuration);
        schedule.push({
          id: `block-${blockIdCounter++}`,
          startTime: fmt(currentMin),
          endTime: fmt(mealEnd),
          type: 'hydration_rest_break',
          title: 'Lunch & Shaded Thermal Recovery Interval',
          description: 'Extended recovery in sheltered rest area. Replenish fluids, light meals, and electrolyte intake.',
          locationContext: 'shaded_area',
          riskCategory: 'elevated_caution',
          guidance: 'Ensure workers remain in well-ventilated or air-cooled break areas.',
        });
        currentMin = mealEnd;
      }
    }

    // Afternoon Recovery / Closing Window
    if (currentMin < endMinutes) {
      schedule.push({
        id: `block-${blockIdCounter++}`,
        startTime: fmt(currentMin),
        endTime: fmt(endMinutes),
        type: 'core_outdoor_work',
        title: 'Late Afternoon Outdoor Resumption & Site Debrief',
        description: 'Complete remaining field operations as solar radiation recedes. Clean up worksite, inspect equipment, and log daily progress.',
        locationContext: 'outdoor',
        riskCategory: 'elevated_caution',
        guidance: 'Maintain steady hydration as ambient temperatures slowly descend.',
      });
      currentMin = endMinutes;
    }

    // Calculate schedule breakdown metrics
    let totalRestMinutes = 0;
    let indoorMinutes = 0;
    let outdoorMinutes = 0;

    for (const b of schedule) {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      const dur = (eh * 60 + em) - (sh * 60 + sm);
      if (b.type === 'hydration_rest_break') totalRestMinutes += dur;
      else if (b.type === 'indoor_task_alternative') indoorMinutes += dur;
      else outdoorMinutes += dur;
    }

    // Best available windows
    const bestWindows = HeatAssessmentService.findBestWorkWindows(fullAssessments);

    // Contextual recommendations
    const recommendations = [];

    if (worstCategory === 'severe_heat_advisory' || worstCategory === 'high_caution') {
      recommendations.push({
        title: 'Shift Demanding Outdoor Tasks Away From Midday',
        description: `Forecast peak apparent temperature reaches ${maxAppTemp}°C around ${peakHeatWindow} with intense solar radiation. ${
          request.indoorTasksAvailable 
            ? 'The generated plan relocates heavy tasks indoors during this peak.'
            : 'Consider implementing rotational 20-minute shaded intervals or early morning shift scheduling.'
        }`,
        severity: worstCategory === 'severe_heat_advisory' ? ('warning' as const) : ('caution' as const),
        category: 'Thermal Timing',
      });
    }

    if (request.shadeAvailability === 'limited') {
      recommendations.push({
        title: 'Erect Portable Shade Canopies or Pop-Up Shelters',
        description: `Current site configuration indicates limited shade. Direct solar exposure (${shiftAssessments[0]?.solarRadiation || 800} W/m² peak) significantly increases thermal strain on unshaded crews.`,
        severity: 'caution' as const,
        category: 'Worksite Engineering',
      });
    }

    if (request.workIntensity === 'heavy') {
      recommendations.push({
        title: 'Implement Buddy System & Metabolic Pace Moderation',
        description: 'Heavy physical exertion multiplies core body heat production. Pair crew members to monitor for early signs of heat fatigue, dizziness, or slowed reaction time.',
        severity: 'info' as const,
        category: 'Crew Operations',
      });
    }

    recommendations.push({
      title: 'Review Hydration Logistics Prior to Shift Dispatch',
      description: 'Ensure a minimum of 750ml potable, cool drinking water is readily accessible per worker per hour during elevated caution periods.',
      severity: 'info' as const,
      category: 'Hydration Logistics',
    });

    const now = new Date().toISOString();
    const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return {
      id: planId,
      name: `${loc.name} ${profile.title} Shift Plan`,
      createdAt: now,
      updatedAt: now,
      isSimulatedData,
      dataSourceLabel,
      request,
      location: loc,
      summary: {
        overallRisk: worstCategory,
        peakHeatWindow,
        maxTemperature: maxTemp,
        maxApparentTemperature: maxAppTemp,
        totalShiftHours: Math.round(durationHours * 10) / 10,
        totalRestBreakMinutes: totalRestMinutes,
        indoorWorkHours: Math.round((indoorMinutes / 60) * 10) / 10,
        outdoorWorkHours: Math.round((outdoorMinutes / 60) * 10) / 10,
        favourableWorkWindowCount: bestWindows.length,
      },
      recommendations,
      schedule,
      bestWindows,
      hourlyAssessments: shiftAssessments,
    };
  }
}
