import {
  DashboardData,
  LocationInfo,
  ShiftPlan,
  ShiftPlanRequest,
  WorkerProfile,
} from '../types/index.js';

// In production (Amplify), VITE_API_BASE_URL points to the API Gateway URL.
// In local dev, it is unset and Vite's proxy forwards /api to localhost:5001.
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

export interface AppConfig {
  supportedLocations: LocationInfo[];
  workerProfiles: WorkerProfile[];
  defaultLocationId: string;
  defaultProfileId: string;
  environmentalTrack: string;
  openMeteoAttribution: string;
}

// Fallback locations if backend unreachable during initial load
export const FALLBACK_LOCATIONS: LocationInfo[] = [
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
  { id: 'delhi', name: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, timezone: 'Asia/Kolkata' },
];

export const FALLBACK_PROFILES: WorkerProfile[] = [
  {
    id: 'outdoor_maintenance',
    title: 'Outdoor Maintenance Crew',
    description: 'Municipal, roadway, and grounds facility maintenance crews performing varied physical upkeep.',
    defaultStartTime: '09:00',
    defaultEndTime: '17:00',
    defaultIntensity: 'heavy',
    defaultShade: 'limited',
    defaultSetting: 'mostly_outdoors',
    indoorTasksFeasible: true,
    flexibility: 'moderate',
  },
  {
    id: 'construction',
    title: 'Civil Construction Crew',
    description: 'Heavy structural, masonry, and equipment handling outdoors with high metabolic output.',
    defaultStartTime: '08:00',
    defaultEndTime: '16:30',
    defaultIntensity: 'heavy',
    defaultShade: 'limited',
    defaultSetting: 'mostly_outdoors',
    indoorTasksFeasible: true,
    flexibility: 'moderate',
  },
  {
    id: 'delivery',
    title: 'Urban Delivery Riders',
    description: 'Two-wheeler parcel and food transit exposed to asphalt ambient radiation and direct midday sun.',
    defaultStartTime: '10:00',
    defaultEndTime: '18:00',
    defaultIntensity: 'moderate',
    defaultShade: 'limited',
    defaultSetting: 'mostly_outdoors',
    indoorTasksFeasible: false,
    flexibility: 'low',
  },
  {
    id: 'sanitation',
    title: 'Sanitation & Waste Team',
    description: 'Door-to-door and street sanitation workers with high walking cadence and physical lifting.',
    defaultStartTime: '06:00',
    defaultEndTime: '14:00',
    defaultIntensity: 'moderate',
    defaultShade: 'partial',
    defaultSetting: 'mostly_outdoors',
    indoorTasksFeasible: true,
    flexibility: 'moderate',
  },
  {
    id: 'street_vendor',
    title: 'Street Vendors & Market Staff',
    description: 'Stationary or cart retail staff in open markets with partial canopy coverage.',
    defaultStartTime: '09:00',
    defaultEndTime: '17:00',
    defaultIntensity: 'light',
    defaultShade: 'partial',
    defaultSetting: 'mixed_indoor_outdoor',
    indoorTasksFeasible: true,
    flexibility: 'high',
  },
  {
    id: 'agricultural',
    title: 'Agricultural Field Workers',
    description: 'Open cultivation, harvesting, and irrigation labor in unsheltered rural fields.',
    defaultStartTime: '06:30',
    defaultEndTime: '14:30',
    defaultIntensity: 'heavy',
    defaultShade: 'limited',
    defaultSetting: 'mostly_exposed',
    indoorTasksFeasible: false,
    flexibility: 'moderate',
  },
];

export class ApiService {
  public static async getConfig(): Promise<AppConfig> {
    try {
      const res = await fetch(`${API_BASE}/config`);
      if (!res.ok) throw new Error('Config fetch failed');
      return await res.json();
    } catch {
      return {
        supportedLocations: FALLBACK_LOCATIONS,
        workerProfiles: FALLBACK_PROFILES,
        defaultLocationId: 'chennai',
        defaultProfileId: 'outdoor_maintenance',
        environmentalTrack: 'Heat and Water',
        openMeteoAttribution: 'Weather data by Open-Meteo (https://open-meteo.com/)',
      };
    }
  }

  public static async getDashboard(
    locationId = 'chennai',
    profileId = 'outdoor_maintenance'
  ): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard?location=${locationId}&profile=${profileId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Failed to fetch dashboard (HTTP ${res.status})`);
    }
    return await res.json();
  }

  public static async generateShiftPlan(
    request: ShiftPlanRequest
  ): Promise<ShiftPlan> {
    const res = await fetch(`${API_BASE}/shift-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Failed to generate shift plan');
    }
    return await res.json();
  }

  public static async saveShiftPlan(plan: ShiftPlan): Promise<ShiftPlan> {
    const res = await fetch(`${API_BASE}/shift-plans/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });

    if (!res.ok) {
      throw new Error('Failed to save shift plan');
    }
    return await res.json();
  }

  public static async getSavedPlans(): Promise<ShiftPlan[]> {
    const res = await fetch(`${API_BASE}/shift-plans`);
    if (!res.ok) throw new Error('Failed to retrieve saved plans');
    return await res.json();
  }

  public static async getSavedPlanById(id: string): Promise<ShiftPlan> {
    const res = await fetch(`${API_BASE}/shift-plans/${id}`);
    if (!res.ok) throw new Error(`Plan ${id} not found`);
    return await res.json();
  }

  public static async deletePlan(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/shift-plans/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  }
}
