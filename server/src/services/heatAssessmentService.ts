import {
  HourlyWeatherPoint,
  HourlyAssessment,
  RiskCategory,
  WorkIntensity,
  ShadeAvailability,
  WorkSetting,
  BestWorkWindow,
} from '../types/index.js';

export interface AssessmentOptions {
  workIntensity?: WorkIntensity;
  shadeAvailability?: ShadeAvailability;
  workSetting?: WorkSetting;
}

export class HeatAssessmentService {
  /**
   * Assesses an individual hourly point based on weather and operational factors.
   * Internal heuristic produces an explainable Heat Strain Index (0-100).
   */
  public static assessHour(
    point: HourlyWeatherPoint,
    options: AssessmentOptions = {}
  ): HourlyAssessment {
    const intensity = options.workIntensity || 'heavy';
    const shade = options.shadeAvailability || 'limited';
    const setting = options.workSetting || 'mostly_outdoors';

    // 1. Base thermal load (apparent temp or air temp baseline)
    const thermalBase = point.apparentTemperature ?? point.temperature;

    // Baseline scale: 24°C is nominal comfort (0), 44°C+ is extreme heat (80)
    let score = Math.max(0, (thermalBase - 24) * 4.0);

    const reasons: string[] = [];

    // 2. Humidity impact on evaporative sweat efficiency
    if (point.relativeHumidity > 70 && point.temperature > 30) {
      score += 8;
      reasons.push(`High relative humidity (${point.relativeHumidity}%) restricts evaporative sweat cooling.`);
    } else if (point.relativeHumidity > 55 && point.temperature > 32) {
      score += 4;
      reasons.push(`Moderate coastal humidity (${point.relativeHumidity}%) elevates perceived heat burden.`);
    }

    // 3. Solar Radiation & Worksite Shade
    const solar = point.solarRadiation ?? 0;
    if (solar > 700) {
      if (shade === 'limited') {
        score += 12;
        reasons.push(`Intense direct solar radiation (${solar} W/m²) with limited worksite canopy cover.`);
      } else if (shade === 'partial') {
        score += 6;
        reasons.push(`Strong solar radiation (${solar} W/m²); partial shade provides moderate mitigation.`);
      } else {
        score += 2;
        reasons.push(`High ambient solar radiation (${solar} W/m²), but mitigated by good worksite shade.`);
      }
    } else if (solar > 400 && shade === 'limited') {
      score += 6;
      reasons.push(`Direct sun exposure (${solar} W/m²) on exposed worksite areas.`);
    }

    // 4. Metabolic Work Intensity
    if (intensity === 'heavy') {
      score += 10;
      reasons.push('Heavy manual exertion markedly increases internal metabolic heat generation.');
    } else if (intensity === 'moderate') {
      score += 5;
      reasons.push('Moderate continuous physical pacing increases crew hydration demands.');
    }

    // 5. Exposure Setting
    if (setting === 'mostly_exposed') {
      score += 6;
      reasons.push('Unsheltered outdoor setting directly absorbs ground and structural heat reflection.');
    } else if (setting === 'mixed_indoor_outdoor') {
      score -= 5;
      reasons.push('Periodic access to indoor shaded zones provides metabolic recovery intervals.');
    }

    // 6. Wind Speed Convective Factor
    if (point.windSpeed < 5 && point.temperature > 32) {
      score += 4;
      reasons.push(`Stagnant air conditions (wind < 5 km/h) restrict natural body heat dissipation.`);
    } else if (point.windSpeed > 25 && point.temperature > 38) {
      score += 3;
      reasons.push(`High hot wind speed (${point.windSpeed} km/h) creates convective heat transfer.`);
    }

    // Clamp score between 0 and 100
    const heatStrainIndex = Math.min(100, Math.max(0, Math.round(score)));

    // Categorization
    let category: RiskCategory;
    let categoryLabel: string;
    let recommendedAction: string;

    if (heatStrainIndex < 38) {
      category = 'lower_relative_concern';
      categoryLabel = 'Lower Relative Concern';
      recommendedAction = 'Favourable window for primary outdoor tasks. Maintain standard scheduled hydration.';
    } else if (heatStrainIndex < 62) {
      category = 'elevated_caution';
      categoryLabel = 'Elevated Caution';
      recommendedAction = 'Provide mandatory shaded rest breaks every 60 minutes. Increase crew water access.';
    } else if (heatStrainIndex < 82) {
      category = 'high_caution';
      categoryLabel = 'High Caution';
      recommendedAction = 'Reassess demanding outdoor tasks. Shift heavy labor indoors or to cooler hours; monitor for heat fatigue.';
    } else {
      category = 'severe_heat_advisory';
      categoryLabel = 'Severe Heat Advisory';
      recommendedAction = 'Reconsider non-essential heavy outdoor labor. Require sheltered recovery; enforce strict safety checks.';
    }

    if (reasons.length === 0) {
      reasons.push('Moderate forecast ambient conditions within typical seasonal tolerance.');
    }

    return {
      time: point.time,
      hour: point.hour,
      temperature: point.temperature,
      apparentTemperature: point.apparentTemperature,
      relativeHumidity: point.relativeHumidity,
      windSpeed: point.windSpeed,
      solarRadiation: point.solarRadiation,
      heatStrainIndex,
      category,
      categoryLabel,
      primaryReasons: reasons,
      recommendedAction,
    };
  }

  /**
   * Assesses a full array of hourly points.
   */
  public static assessTimeline(
    points: HourlyWeatherPoint[],
    options: AssessmentOptions = {}
  ): HourlyAssessment[] {
    return points.map(p => this.assessHour(p, options));
  }

  /**
   * Identifies candidate work windows (contiguous hours of lower relative concern).
   */
  public static findBestWorkWindows(assessments: HourlyAssessment[]): BestWorkWindow[] {
    const windows: BestWorkWindow[] = [];
    let currentWindow: HourlyAssessment[] = [];

    for (const item of assessments) {
      // Daylight or working hours check (e.g. 06:00 to 19:00)
      if (item.hour >= 6 && item.hour <= 19) {
        if (item.category === 'lower_relative_concern' || item.category === 'elevated_caution') {
          currentWindow.push(item);
        } else {
          if (currentWindow.length >= 2) {
            windows.push(this.compileWindow(currentWindow));
          }
          currentWindow = [];
        }
      } else {
        if (currentWindow.length >= 2) {
          windows.push(this.compileWindow(currentWindow));
        }
        currentWindow = [];
      }
    }

    if (currentWindow.length >= 2) {
      windows.push(this.compileWindow(currentWindow));
    }

    // Sort by most favourable (lowest average HSI)
    return windows.sort((a, b) => a.avgApparentTemperature - b.avgApparentTemperature);
  }

  private static compileWindow(items: HourlyAssessment[]): BestWorkWindow {
    const startHour = items[0].hour.toString().padStart(2, '0') + ':00';
    const endHour = (items[items.length - 1].hour + 1).toString().padStart(2, '0') + ':00';
    const avgTemp = Math.round((items.reduce((s, i) => s + i.temperature, 0) / items.length) * 10) / 10;
    const avgAppTemp = Math.round((items.reduce((s, i) => s + i.apparentTemperature, 0) / items.length) * 10) / 10;
    const worstCategory = items.some(i => i.category === 'elevated_caution')
      ? 'elevated_caution'
      : 'lower_relative_concern';

    const isMorning = items[0].hour < 11;
    return {
      startTime: startHour,
      endTime: endHour,
      durationHours: items.length,
      avgTemperature: avgTemp,
      avgApparentTemperature: avgAppTemp,
      category: worstCategory,
      recommendedUse: isMorning 
        ? 'Optimal for high-intensity physical tasks, lifting, and equipment operation.'
        : 'Suitable for secondary outdoor tasks, route wrap-up, and site cleanup.',
      rationale: `Forecast apparent temperatures average ${avgAppTemp}°C with moderate solar load, providing a comparatively more favourable operational window.`,
    };
  }
}
