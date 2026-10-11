import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../components/AppShell.js';
import { ApiService } from '../services/api.js';
import { DashboardData } from '../types/index.js';
import { HeatRiskBadge } from '../components/HeatRiskBadge.js';
import { WorkWindowCard } from '../components/WorkWindowCard.js';
import { ShiftTimeline } from '../components/ShiftTimeline.js';
import {
  Thermometer,
  Wind,
  Droplets,
  Sun,
  Clock,
  ArrowRight,
  CalendarClock,
  CheckSquare,
  Bookmark,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLocationId } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = () => {
    setLoading(true);
    setError(null);
    ApiService.getDashboard(selectedLocationId, 'outdoor_maintenance')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedLocationId]);

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-charcoal-200/50 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-charcoal-200/50 rounded-2xl" />
          <div className="h-32 bg-charcoal-200/50 rounded-2xl" />
          <div className="h-32 bg-charcoal-200/50 rounded-2xl" />
          <div className="h-32 bg-charcoal-200/50 rounded-2xl" />
        </div>
        <div className="h-64 bg-charcoal-200/50 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="gt-card p-8 text-center max-w-lg mx-auto my-12 border-rose-200">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-charcoal-900 mb-2">
          Unable to Load Worksite Conditions
        </h3>
        <p className="text-xs text-charcoal-600 mb-4">
          {error || 'An unexpected error occurred while contacting the forecast service.'}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={loadDashboard}
            className="gt-btn-primary text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { currentConditions, peakHeatConditions, bestWindows, timeline, primaryAction, location, profile } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 rounded-2xl p-6 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shift Intelligence Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, Supervisor
          </h1>
          <p className="text-xs text-charcoal-200 mt-1 max-w-xl">
            Currently monitoring <strong>{location.name}, {location.state}</strong> for the <strong>{profile.title}</strong>. Thermal peak expected between 12:00 – 14:00.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/app/planner')}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all shadow"
          >
            <CalendarClock className="w-4 h-4" />
            <span>Plan Today's Shift</span>
          </button>
          <button
            onClick={() => navigate('/app/safety')}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2.5 rounded-xl text-xs transition-all border border-white/10"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Crew Checklist</span>
          </button>
        </div>
      </div>

      {/* Primary Conditions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Air Temperature */}
        <div className="gt-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-charcoal-500">Air Temperature</span>
            <div className="text-2xl font-extrabold text-charcoal-900 mt-1 font-mono">
              {currentConditions.temperature}°C
            </div>
            <div className="text-[11px] text-charcoal-500 mt-1">
              Peak: <strong className="text-rose-600 font-mono">{peakHeatConditions.temperature}°C</strong> around {peakHeatConditions.hour}:00
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
            <Thermometer className="w-5 h-5" />
          </div>
        </div>

        {/* Apparent Heat Index */}
        <div className="gt-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-charcoal-500">Apparent Heat Index</span>
            <div className="text-2xl font-extrabold text-charcoal-900 mt-1 font-mono">
              {currentConditions.apparentTemperature}°C
            </div>
            <div className="text-[11px] text-charcoal-500 mt-1">
              Thermal feels-like index
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <Sun className="w-5 h-5" />
          </div>
        </div>

        {/* Humidity */}
        <div className="gt-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-charcoal-500">Relative Humidity</span>
            <div className="text-2xl font-extrabold text-charcoal-900 mt-1 font-mono">
              {currentConditions.relativeHumidity}%
            </div>
            <div className="text-[11px] text-charcoal-500 mt-1">
              {currentConditions.relativeHumidity > 65 ? 'Elevates perceived heat' : 'Moderate sweat efficiency'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Droplets className="w-5 h-5" />
          </div>
        </div>

        {/* Heat Strain Assessment */}
        <div className="gt-card p-5 flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-charcoal-500">Advisory Heat Category</span>
            <div className="mt-2">
              <HeatRiskBadge category={currentConditions.assessment.category} size="md" score={currentConditions.assessment.heatStrainIndex} />
            </div>
            <div className="text-[10px] text-charcoal-400 mt-2 font-mono">
              HSI Score: {currentConditions.assessment.heatStrainIndex}/100 (Internal Heuristic)
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Primary Action Card (Supervisor Decision Support) */}
      <div className="gt-card p-5 border-l-4 border-l-forest-700 bg-forest-50/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-forest-800 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-forest-200 text-forest-900 px-2 py-0.5 rounded">
                  Primary Supervisor Recommendation
                </span>
                <span className="text-xs font-semibold text-charcoal-900">
                  {primaryAction.title}
                </span>
              </div>
              <p className="text-xs text-charcoal-700 mt-1 font-medium leading-relaxed">
                {primaryAction.recommendation}
              </p>
              <p className="text-[11px] text-charcoal-500 mt-1 italic">
                Rationale: {primaryAction.rationale}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/app/planner')}
            className="gt-btn-primary text-xs shrink-0"
          >
            <span>Review Shift Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Work Windows */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-charcoal-900">
              Best Available Outdoor Work Windows
            </h2>
            <p className="text-xs text-charcoal-500">
              Periods forecast to provide comparatively more favourable outdoor conditions.
            </p>
          </div>
          <span className="text-xs font-medium text-forest-800">
            {bestWindows.length} Windows Identified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bestWindows.map((win, idx) => (
            <WorkWindowCard key={`${win.startTime}-${win.endTime}`} window={win} rank={idx + 1} />
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <ShiftTimeline
        timeline={timeline}
        shiftStartHour={parseInt(profile.defaultStartTime.split(':')[0], 10)}
        shiftEndHour={parseInt(profile.defaultEndTime.split(':')[0], 10)}
      />

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <button
          onClick={() => navigate('/app/planner')}
          className="gt-card p-4 text-left hover:border-forest-600 group flex items-start gap-3"
        >
          <div className="p-2 rounded-xl bg-forest-100 text-forest-800 group-hover:bg-forest-800 group-hover:text-white transition-colors">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-charcoal-900 group-hover:text-forest-800">
              Custom Shift Planner
            </h3>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Adjust work intensity, shade levels, and generate adaptive schedules.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/app/outlook')}
          className="gt-card p-4 text-left hover:border-forest-600 group flex items-start gap-3"
        >
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 group-hover:bg-amber-700 group-hover:text-white transition-colors">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-charcoal-900 group-hover:text-forest-800">
              Hourly Meteorological Outlook
            </h3>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Inspect solar radiation, wind speeds, and hourly heat curves.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/app/plans')}
          className="gt-card p-4 text-left hover:border-forest-600 group flex items-start gap-3"
        >
          <div className="p-2 rounded-xl bg-teal-100 text-teal-800 group-hover:bg-teal-700 group-hover:text-white transition-colors">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-charcoal-900 group-hover:text-forest-800">
              Saved Shift Plans
            </h3>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Access previously generated schedules and supervisor notes.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
