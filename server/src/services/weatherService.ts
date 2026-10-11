import { HourlyWeatherPoint, LocationInfo } from '../types/index.js';
import { SUPPORTED_LOCATIONS } from '../data/operationalConfig.js';

interface CacheEntry {
  timestamp: number;
  data: HourlyWeatherPoint[];
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
   * Retrieves hourly weather forecast for a supported location and date.
   * Connects directly to Open-Meteo numerical weather prediction API.
   * Caches responses for 15 minutes to minimize redundant requests.
   * If Open-Meteo is temporarily unreachable, serves stale cache if available,
   * otherwise throws an informative error without fabricating weather data.
   */
  public static async getForecast(
    locationId: string,
    targetDate?: string
  ): Promise<WeatherResponse> {
    const loc = SUPPORTED_LOCATIONS.find(l => l.id.toLowerCase() === locationId.toLowerCase()) 
      || SUPPORTED_LOCATIONS[0];

    const todayStr = targetDate || new Date().toISOString().split('T')[0];
    const cacheKey = `${loc.id}_${todayStr}`;

    // Return fresh cached forecast if available
    const cached = weatherCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return {
        location: loc,
        date: todayStr,
        hourly: cached.data,
        isSimulatedData: false,
        dataSourceLabel: cached.dataSourceLabel,
        attribution: 'Weather data by Open-Meteo (https://open-meteo.com/)',
        retrievedAt: new Date(cached.timestamp).toISOString(),
      };
    }

    // Live fetch from Open-Meteo
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

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

      const entry: CacheEntry = {
        timestamp: Date.now(),
        data: hourlyPoints,
        dataSourceLabel: 'Open-Meteo Meteorological Forecast',
      };
      weatherCache.set(cacheKey, entry);

      return {
        location: loc,
        date: todayStr,
        hourly: hourlyPoints,
        isSimulatedData: false,
        dataSourceLabel: 'Open-Meteo Meteorological Forecast',
        attribution: 'Weather data by Open-Meteo (https://open-meteo.com/)',
        retrievedAt: new Date(entry.timestamp).toISOString(),
      };
    } catch (err: unknown) {
      // If we have an existing (even stale) cached forecast, serve it with clear timestamp attribution
      if (cached) {
        return {
          location: loc,
          date: todayStr,
          hourly: cached.data,
          isSimulatedData: false,
          dataSourceLabel: cached.dataSourceLabel,
          attribution: 'Weather data by Open-Meteo (https://open-meteo.com/)',
          retrievedAt: new Date(cached.timestamp).toISOString(),
          note: `Live forecast provider temporarily unreachable. Showing cached forecast from ${new Date(cached.timestamp).toLocaleTimeString()}.`,
        };
      }

      const errMessage = err instanceof Error ? err.message : 'Network error';
      throw new Error(`Weather forecast temporarily unavailable from Open-Meteo for ${loc.name} (${errMessage}).`);
    }
  }

  /**
   * Helper to pre-populate cache for testing purposes
   */
  public static setTestForecast(locationId: string, date: string, hourly: HourlyWeatherPoint[]): void {
    const loc = SUPPORTED_LOCATIONS.find(l => l.id.toLowerCase() === locationId.toLowerCase()) 
      || SUPPORTED_LOCATIONS[0];
    weatherCache.set(`${loc.id}_${date}`, {
      timestamp: Date.now(),
      data: hourly,
      dataSourceLabel: 'Test Fixture Forecast',
    });
  }

  public static clearCache(): void {
    weatherCache.clear();
  }
}
