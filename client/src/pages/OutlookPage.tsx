import React, { useState, useEffect } from 'react';
import { useApp } from '../components/AppShell.js';
import { ApiService } from '../services/api.js';
import { DashboardData } from '../types/index.js';
import { HeatRiskBadge } from '../components/HeatRiskBadge.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  SunMedium,
  Thermometer,
  Droplets,
  Wind,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';

export const OutlookPage: React.FC = () => {
  const { selectedLocationId } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewScope, setViewScope] = useState<'24h' | 'shift'>('24h');

  const loadOutlook = () => {
    setLoading(true);
    setError(null);
    ApiService.getDashboard(selectedLocationId, 'outdoor_maintenance')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve hourly outlook');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOutlook();
  }, [selectedLocationId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-charcoal-200/50 rounded-2xl w-full" />
        <div className="h-72 bg-charcoal-200/50 rounded-2xl w-full" />
        <div className="h-72 bg-charcoal-200/50 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="gt-card p-8 text-center max-w-lg mx-auto my-12 border-rose-200">
        <h3 className="text-base font-semibold text-charcoal-900 mb-2">
          Unable to Load Hourly Outlook
        </h3>
        <p className="text-xs text-charcoal-600 mb-4">
          {error || 'An unexpected error occurred while fetching meteorological data.'}
        </p>
        <button
          onClick={loadOutlook}
          className="gt-btn-primary text-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Filter for 24h or shift view (09:00 - 17:00 default)
  const displayTimeline = viewScope === 'shift'
    ? data.timeline.filter(t => t.hour >= 9 && t.hour <= 17)
    : data.timeline;

  const chartData = displayTimeline.map((item) => ({
    time: `${item.hour.toString().padStart(2, '0')}:00`,
    temperature: item.temperature,
    apparentTemperature: item.apparentTemperature,
    relativeHumidity: item.relativeHumidity,
    solarRadiation: item.solarRadiation || 0,
    heatStrainIndex: item.heatStrainIndex,
    category: item.categoryLabel,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold uppercase tracking-wider">
            <SunMedium className="w-4 h-4" />
            <span>Meteorological Intelligence</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-charcoal-900 mt-1">
            Hourly Heat Outlook: {data.location.name}
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Hourly progression of air temperature, apparent heat index, solar radiation, and humidity.
          </p>
        </div>

        {/* View Scope Toggle */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-charcoal-200 text-xs">
          <button
            type="button"
            onClick={() => setViewScope('24h')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewScope === '24h'
                ? 'bg-forest-800 text-white shadow-xs font-semibold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Full 24-Hour Day
          </button>
          <button
            type="button"
            onClick={() => setViewScope('shift')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewScope === 'shift'
                ? 'bg-forest-800 text-white shadow-xs font-semibold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Shift Window Only (09:00–17:00)
          </button>
        </div>
      </div>

      {/* Chart 1: Temperature & Apparent Heat Index */}
      <div className="gt-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-600" />
              <span>Thermal Profile: Air Temperature vs. Apparent Heat Index (°C)</span>
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Comparison between ambient sensor temperature and physiological apparent thermal load.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Peak: {data.peakHeatConditions.apparentTemperature}°C at {data.peakHeatConditions.hour}:00
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebf0ed" />
              <XAxis dataKey="time" stroke="#8e9d97" fontSize={11} />
              <YAxis domain={['auto', 'auto']} stroke="#8e9d97" fontSize={11} unit="°C" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #d8e0dc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="apparentTemperature"
                name="Apparent Heat Index (°C)"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#e11d48' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                name="Air Temperature (°C)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Solar Radiation & Relative Humidity */}
      <div className="gt-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
              <SunMedium className="w-4 h-4 text-amber-500" />
              <span>Solar Radiation (W/m²) & Relative Humidity (%)</span>
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Direct shortwave solar irradiance drives radiant heat absorption while humidity modulates sweat evaporation.
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebf0ed" />
              <XAxis dataKey="time" stroke="#8e9d97" fontSize={11} />
              <YAxis yAxisId="left" stroke="#8e9d97" fontSize={11} unit=" W/m²" />
              <YAxis yAxisId="right" orientation="right" stroke="#8e9d97" fontSize={11} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #d8e0dc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="solarRadiation"
                name="Solar Radiation (W/m²)"
                fill="#fef3c7"
                stroke="#d97706"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="relativeHumidity"
                name="Relative Humidity (%)"
                stroke="#0284c7"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Breakdown Table */}
      <div className="gt-card overflow-hidden">
        <div className="p-4 border-b border-charcoal-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-charcoal-900">
            Tabular Hourly Breakdown ({displayTimeline.length} Hours)
          </h2>
          <span className="text-xs text-charcoal-500">
            GlideTherm Heat Strain Heuristic
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-50 text-charcoal-600 font-semibold border-b border-charcoal-200">
              <tr>
                <th className="px-4 py-3">Hour</th>
                <th className="px-4 py-3">Air Temp</th>
                <th className="px-4 py-3">Feels Like</th>
                <th className="px-4 py-3">Humidity</th>
                <th className="px-4 py-3">Wind</th>
                <th className="px-4 py-3">Solar Irradiance</th>
                <th className="px-4 py-3">Advisory Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {displayTimeline.map((item) => (
                <tr key={item.hour} className="hover:bg-charcoal-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-charcoal-900">
                    {item.hour.toString().padStart(2, '0')}:00
                  </td>
                  <td className="px-4 py-3 font-mono font-medium">{item.temperature}°C</td>
                  <td className="px-4 py-3 font-mono font-bold text-rose-600">{item.apparentTemperature}°C</td>
                  <td className="px-4 py-3">{item.relativeHumidity}%</td>
                  <td className="px-4 py-3">{item.windSpeed} km/h</td>
                  <td className="px-4 py-3 font-mono">{item.solarRadiation || 0} W/m²</td>
                  <td className="px-4 py-3">
                    <HeatRiskBadge category={item.category} size="sm" score={item.heatStrainIndex} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scientific Heuristic Note */}
      <div className="p-4 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs text-charcoal-600 flex items-start gap-3 leading-relaxed">
        <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-charcoal-900 block mb-0.5">Methodology & Assessment Disclaimer:</strong>
          The GlideTherm Heat Strain Index is a deterministic operational heuristic incorporating air temperature, humidity, solar radiation, metabolic activity rate, and worksite shade. It provides situational decision support and is NOT a certified Wet-Bulb Globe Temperature (WBGT) device or medical diagnosis. Applicable workplace safety regulations and local meteorological warnings always take precedence.
        </div>
      </div>
    </div>
  );
};
