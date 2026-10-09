export type RiskCategory = 
  | 'lower_relative_concern'
  | 'elevated_caution'
  | 'high_caution'
  | 'severe_heat_advisory';

export type WorkIntensity = 'light' | 'moderate' | 'heavy';
export type ShadeAvailability = 'good' | 'partial' | 'limited';
export type WorkSetting = 'mostly_outdoors' | 'mixed_indoor_outdoor' | 'mostly_exposed';

export interface LocationInfo {
  id: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface WorkerProfile {
  id: string;
  title: string;
  description: string;
  defaultStartTime: string;
  defaultEndTime: string;
  defaultIntensity: WorkIntensity;
  defaultShade: ShadeAvailability;
  defaultSetting: WorkSetting;
  indoorTasksFeasible: boolean;
  flexibility: 'high' | 'moderate' | 'low';
}

export interface HourlyWeatherPoint {
  time: string; // ISO string or "YYYY-MM-DDTHH:00"
  hour: number; // 0-23
  temperature: number; // °C
  apparentTemperature: number; // °C
  relativeHumidity: number; // %
  windSpeed: number; // km/h
  solarRadiation?: number; // W/m²
  isDaytime?: boolean;
}

export interface HourlyAssessment {
  time: string;
  hour: number;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  windSpeed: number;
  solarRadiation?: number;
  heatStrainIndex: number; // 0 - 100 internal heuristic
  category: RiskCategory;
  categoryLabel: string;
  primaryReasons: string[];
  recommendedAction: string;
}

export interface BestWorkWindow {
  startTime: string;
  endTime: string;
  durationHours: number;
  avgTemperature: number;
  avgApparentTemperature: number;
  category: RiskCategory;
  recommendedUse: string;
  rationale: string;
}

export type ScheduleBlockType = 
  | 'core_outdoor_work'
  | 'indoor_task_alternative'
  | 'hydration_rest_break'
  | 'heat_review_checkpoint'
  | 'shift_briefing';

export interface ScheduleBlock {
  id: string;
  startTime: string;
  endTime: string;
  type: ScheduleBlockType;
  title: string;
  description: string;
  locationContext: 'outdoor' | 'indoor' | 'shaded_area';
  riskCategory: RiskCategory;
  guidance: string;
}

export interface ShiftPlanRequest {
  locationId: string;
  date: string; // YYYY-MM-DD
  profileId: string;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  workIntensity: WorkIntensity;
  shadeAvailability: ShadeAvailability;
  workSetting: WorkSetting;
  breakPreferenceMinutes: number; // e.g. 15, 30, 45
  indoorTasksAvailable: boolean;
  shiftReschedulingAllowed: boolean;
  notes?: string;
}

export interface ShiftPlan {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isSimulatedData: boolean;
  dataSourceLabel: string;
  request: ShiftPlanRequest;
  location: LocationInfo;
  summary: {
    overallRisk: RiskCategory;
    peakHeatWindow: string;
    maxTemperature: number;
    maxApparentTemperature: number;
    totalShiftHours: number;
    totalRestBreakMinutes: number;
    indoorWorkHours: number;
    outdoorWorkHours: number;
    favourableWorkWindowCount: number;
  };
  recommendations: Array<{
    title: string;
    description: string;
    severity: 'info' | 'caution' | 'warning';
    category: string;
  }>;
  schedule: ScheduleBlock[];
  bestWindows: BestWorkWindow[];
  hourlyAssessments: HourlyAssessment[];
}

export interface SafetyChecklistItem {
  id: string;
  category: 'before_shift' | 'during_shift' | 'supervisor_actions';
  title: string;
  description: string;
  isCompleted: boolean;
  priority: 'required' | 'recommended' | 'critical';
}
