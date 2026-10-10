import { HourlyWeatherPoint, LocationInfo } from '../types/index.js';
import { getDeterministicDemoForecast, SUPPORTED_LOCATIONS } from '../data/demoScenario.js';

interface CacheEntry {
  timestamp: number;
  data: HourlyWeatherPoint[];
  isSimulated: boolean;
  dataSourceLabel: string;
}

const weatherCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

export interface WeatherResponse {
  location: LocationInfo;
  date: string;
  hourly: HourlyWeatherPoint[];
  isSimulatedData: boolean;
  dataSourceLabel: string;
  attribution: string;
  retrievedAt: string;
  note?: string;
}

export class WeatherService {
  /**
   * Retrieves weather forecast for a location and date.
   * Uses Open-Meteo free API with strict timeout and fallback to deterministic demo dataset.
   */
  public static async getForecast(
    locationId: string,
    targetDate?: string,
    forceDemo = false
  ): Promise<WeatherResponse> {
    const loc = SUPPORTED_LOCATIONS.find(l => l.id.toLowerCase() === locationId.toLowerCase()) 
      || SUPPORTED_LOCATIONS[0];

    const todayStr = targetDate || new Date().toISOString().split('T')[0];
    const cacheKey = `${loc.id}_${todayStr}_${forceDemo}`;

    // Return cached if fresh
    const cached = weatherCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return {
        location: loc,
        date: todayStr,
        hourly: cached.data,
        isSimulatedData: cached.isSimulated,
        dataSourceLabel: cached.dataSourceLabel,
        attribution: 'Weather data by Open-Meteo (https://open-meteo.com/)',
        retrievedAt: new Date(cached.timestamp).toISOString(),
      };
    }

    if (forceDemo) {
      const demoData = getDeterministicDemoForecast(todayStr);
      weatherCache.set(cacheKey, {
        timestamp: Date.now(),
        data: demoData,
        isSimulated: true,
        dataSourceLabel: 'Deterministic Demonstration Scenario (Chennai Heat Baseline)',
      });
      return {
        location: loc,
        date: todayStr,
        hourly: demoData,
        isSimulatedData: true,
        dataSourceLabel: 'Deterministic Demonstration Scenario (Chennai Heat Baseline)',
        attribution: 'Weather data by Open-Meteo (https://open-meteo.com/)',
        retrievedAt: new Date().toISOString(),
        note: 'Displaying verified demonstration scenario for controlled evaluation.',
      };
    }

    // Attempt live fetch from Open-Meteo
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s timeout

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,shortwave_radiation&timezone=auto&start_date=${todayStr}&end_date=${todayStr}`;

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Open-Meteo responded with HTTP ${res.status}`);
      }

      const json = await res.json() as {
        hourly?: {
          time?: string[];
          temperature_2m?: number[];
          apparent_temperature?: number[];
          relative_humidity_2m?: number[];
          wind_speed_10m?: number[];
          shortwave_radiation?: number[];
        };
      };

      if (!json.hourly || !Array.isArray(json.hourly.time) || json.hourly.time.length === 0) {
        throw new Error('Incomplete hourly forecast payload from Open-Meteo');
      }

      const hourlyPoints: HourlyWeatherPoint[] = json.hourly.time.map((timeStr, idx) => {
        const hour = new Date(timeStr).getHours();
        const temp = json.hourly?.temperature_2m?.[idx] ?? 30;
        const appTemp = json.hourly?.apparent_temperature?.[idx] ?? temp;
        const rh = json.hourly?.relative_humidity_2m?.[idx] ?? 60;
        const wind = json.hourly?.wind_speed_10m?.[idx] ?? 10;
        const sol = json.hourly?.shortwave_radiation?.[idx] ?? 0;

        return {
          time: timeStr,
          hour: isNaN(hour) ? idx : hour,
          temperature: Math.round(temp * 10) / 10,
          apparentTemperature: Math.round(appTemp * 10) / 10,
          relativeHumidity: Math.round(rh),
          windSpeed: Math.round(wind * 10) / 10,
          solarRadiation: Math.round(sol),
          isDaytime: hour >= 6 && hour <= 18,
        };
      });

      weatherCache.set(cacheKey, {
        timestamp: Date.now(),
        data: hourlyPoints,
        isSimulated: false,
        dataSourceLabel: 'Live Open-Meteo Meteorological Forecast',
      });

      return {
        location: loc,
        date: todayStr,
        hourly: hourlyPoints,
        isSimulatedData: false,
        dataSourceLabel: 'Live Open-Meteo Meteorological Forecast',
        attribution: 'Weather data by Open-Meteo (https://open-meteo.com/)',
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      // Graceful fallback to verified deterministic scenario
      const demoData = getDeterministicDemoForecast(todayStr);
      weatherCache.set(cacheKey, {
        timestamp: Date.now(),
        data: demoData,
        isSimulated: true,
        dataSourceLabel: 'Demonstration Fallback (Offline / Sandbox Mode)',
      });

      return {
        location: loc,
        date: todayStr,
        hourly: demoData,
        isSimulatedData: true,
        dataSourceLabel: 'Demonstration Fallback (Offline / Sandbox Mode)',
        attribution: 'Weather data by Open-Meteo (https://open-meteo.com/)',
        retrievedAt: new Date().toISOString(),
        note: 'Live forecast provider unreachable or in offline mode; using verified deterministic scenario.',
      };
    }
  }
}
