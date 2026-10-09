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
  time: string;
  hour: number;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  windSpeed: number;
  solarRadiation?: number;
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
  heatStrainIndex: number;
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
  date: string;
  profileId: string;
  startTime: string;
  endTime: string;
  workIntensity: WorkIntensity;
  shadeAvailability: ShadeAvailability;
  workSetting: WorkSetting;
  breakPreferenceMinutes: number;
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

export interface DashboardData {
  location: LocationInfo;
  date: string;
  isSimulatedData: boolean;
  dataSourceLabel: string;
  attribution: string;
  retrievedAt: string;
  profile: WorkerProfile;
  currentConditions: {
    time: string;
    temperature: number;
    apparentTemperature: number;
    relativeHumidity: number;
    windSpeed: number;
    solarRadiation?: number;
    assessment: HourlyAssessment;
  };
  peakHeatConditions: {
    hour: number;
    temperature: number;
    apparentTemperature: number;
    category: RiskCategory;
    categoryLabel: string;
  };
  bestWindows: BestWorkWindow[];
  timeline: HourlyAssessment[];
  primaryAction: {
    title: string;
    recommendation: string;
    rationale: string;
  };
}
