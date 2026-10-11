import { LocationInfo, WorkerProfile, HourlyWeatherPoint } from '../types/index.js';

export const SUPPORTED_LOCATIONS: LocationInfo[] = [
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'delhi',
    name: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.3850,
    longitude: 78.4867,
    timezone: 'Asia/Kolkata',
  },
];

export const WORKER_PROFILES: WorkerProfile[] = [
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

/**
 * Deterministic baseline demonstration weather for Chennai.
 * Modeled on realistic hot season coastal conditions (High heat + moderate/high coastal humidity).
 */
export function getDeterministicDemoForecast(dateStr: string): HourlyWeatherPoint[] {
  const baseDate = dateStr || '2026-10-11';
  
  // 24 hour deterministic curve:
  // Temp peaks at 13:00 - 14:00 around 38.5°C, apparent temp around 44°C
  const hourlyTemplate = [
    { hour: 0, temp: 28.1, appTemp: 31.4, rh: 82, wind: 9.2, sol: 0 },
    { hour: 1, temp: 27.6, appTemp: 30.8, rh: 84, wind: 8.5, sol: 0 },
    { hour: 2, temp: 27.2, appTemp: 30.2, rh: 86, wind: 7.9, sol: 0 },
    { hour: 3, temp: 26.9, appTemp: 29.8, rh: 87, wind: 7.4, sol: 0 },
    { hour: 4, temp: 26.7, appTemp: 29.5, rh: 88, wind: 7.0, sol: 0 },
    { hour: 5, temp: 26.8, appTemp: 29.6, rh: 87, wind: 7.3, sol: 5 },
    { hour: 6, temp: 28.0, appTemp: 31.5, rh: 83, wind: 8.8, sol: 110 },
    { hour: 7, temp: 30.1, appTemp: 34.2, rh: 77, wind: 10.5, sol: 290 },
    { hour: 8, temp: 32.4, appTemp: 37.1, rh: 71, wind: 12.1, sol: 480 },
    { hour: 9, temp: 34.6, appTemp: 39.8, rh: 65, wind: 13.8, sol: 670 },
    { hour: 10, temp: 36.5, appTemp: 42.1, rh: 60, wind: 15.2, sol: 820 },
    { hour: 11, temp: 37.8, appTemp: 43.6, rh: 56, wind: 16.4, sol: 910 },
    { hour: 12, temp: 38.5, appTemp: 44.5, rh: 54, wind: 17.1, sol: 950 },
    { hour: 13, temp: 38.8, appTemp: 44.9, rh: 53, wind: 17.5, sol: 920 },
    { hour: 14, temp: 38.2, appTemp: 44.1, rh: 55, wind: 18.0, sol: 810 },
    { hour: 15, temp: 36.9, appTemp: 42.4, rh: 61, wind: 18.5, sol: 630 },
    { hour: 16, temp: 35.1, appTemp: 40.2, rh: 67, wind: 18.2, sol: 410 },
    { hour: 17, temp: 33.4, appTemp: 38.0, rh: 72, wind: 17.0, sol: 180 },
    { hour: 18, temp: 31.8, appTemp: 36.2, rh: 76, wind: 15.4, sol: 20 },
    { hour: 19, temp: 30.7, appTemp: 35.0, rh: 79, wind: 14.1, sol: 0 },
    { hour: 20, temp: 29.9, appTemp: 34.0, rh: 80, wind: 13.0, sol: 0 },
    { hour: 21, temp: 29.3, appTemp: 33.2, rh: 81, wind: 11.8, sol: 0 },
    { hour: 22, temp: 28.8, appTemp: 32.5, rh: 82, wind: 10.7, sol: 0 },
    { hour: 23, temp: 28.4, appTemp: 31.9, rh: 83, wind: 9.8, sol: 0 },
  ];

  return hourlyTemplate.map(item => {
    const hourStr = item.hour.toString().padStart(2, '0');
    return {
      time: `${baseDate}T${hourStr}:00`,
      hour: item.hour,
      temperature: item.temp,
      apparentTemperature: item.appTemp,
      relativeHumidity: item.rh,
      windSpeed: item.wind,
      solarRadiation: item.sol,
      isDaytime: item.hour >= 6 && item.hour <= 18,
    };
  });
}
