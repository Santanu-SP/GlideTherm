import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../components/AppShell.js';
import { ApiService } from '../services/api.js';
import {
  ShiftPlan,
  ShiftPlanRequest,
  WorkIntensity,
  ShadeAvailability,
  WorkSetting,
} from '../types/index.js';
import { ScheduleBlockCard } from '../components/ScheduleBlockCard.js';
import { RecommendationCard } from '../components/RecommendationCard.js';
import { HeatRiskBadge } from '../components/HeatRiskBadge.js';
import {
  CalendarClock,
  Save,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  AlertCircle,
  Home,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { locations, profiles, selectedLocationId, setSelectedLocationId, isDemoMode, showToast } = useApp();

  // Form State
  const [profileId, setProfileId] = useState<string>('outdoor_maintenance');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [workIntensity, setWorkIntensity] = useState<WorkIntensity>('heavy');
  const [shadeAvailability, setShadeAvailability] = useState<ShadeAvailability>('limited');
  const [workSetting, setWorkSetting] = useState<WorkSetting>('mostly_outdoors');
  const [breakPreferenceMinutes, setBreakPreferenceMinutes] = useState<number>(15);
  const [indoorTasksAvailable, setIndoorTasksAvailable] = useState<boolean>(true);
  const [shiftReschedulingAllowed, setShiftReschedulingAllowed] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  // Generated Plan State
  const [plan, setPlan] = useState<ShiftPlan | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [planSaveName, setPlanSaveName] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Check if a plan was passed via navigation (e.g. from Saved Plans page)
  useEffect(() => {
    const passedPlan = locationState.state?.loadedPlan as ShiftPlan | undefined;
    if (passedPlan) {
      setPlan(passedPlan);
      setSelectedLocationId(passedPlan.location.id);
      setProfileId(passedPlan.request.profileId);
      setStartTime(passedPlan.request.startTime);
      setEndTime(passedPlan.request.endTime);
      setWorkIntensity(passedPlan.request.workIntensity);
      setShadeAvailability(passedPlan.request.shadeAvailability);
      setWorkSetting(passedPlan.request.workSetting);
      setIndoorTasksAvailable(passedPlan.request.indoorTasksAvailable);
      setPlanSaveName(passedPlan.name);
      showToast(`Loaded "${passedPlan.name}"`, 'info');
    }
  }, [locationState.state]);

  // When profile changes, load profile defaults
  const handleProfileSelect = (pId: string) => {
    setProfileId(pId);
    const prof = profiles.find((p) => p.id === pId);
    if (prof) {
      setStartTime(prof.defaultStartTime);
      setEndTime(prof.defaultEndTime);
      setWorkIntensity(prof.defaultIntensity);
      setShadeAvailability(prof.defaultShade);
      setWorkSetting(prof.defaultSetting);
      setIndoorTasksAvailable(prof.indoorTasksFeasible);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    // Validate boundaries
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (endMins <= startMins) {
      setFormError('Shift end time must be later than shift start time.');
      return;
    }

    if (endMins - startMins < 60) {
      setFormError('Shift duration must be at least 1 hour.');
      return;
    }

    setGenerating(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const payload: ShiftPlanRequest = {
        locationId: selectedLocationId,
        date: todayStr,
        profileId,
        startTime,
        endTime,
        workIntensity,
        shadeAvailability,
        workSetting,
        breakPreferenceMinutes,
        indoorTasksAvailable,
        shiftReschedulingAllowed,
        notes,
      };

      const result = await ApiService.generateShiftPlan(payload, isDemoMode);
      setPlan(result);
      setPlanSaveName(result.name);
      showToast('Climate-adaptive shift plan generated successfully.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Plan generation failed';
      setFormError(msg);
      showToast(msg, 'warning');
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    setIsSaving(true);
    try {
      const updatedPlan: ShiftPlan = {
        ...plan,
        name: planSaveName.trim() || plan.name,
      };
      await ApiService.saveShiftPlan(updatedPlan);
      showToast(`Plan "${updatedPlan.name}" saved to local storage!`, 'success');
    } catch {
      showToast('Failed to save plan', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const defaultProfile = profiles.find((p) => p.id === 'outdoor_maintenance') || profiles[0];
    if (defaultProfile) {
      setProfileId(defaultProfile.id);
      setStartTime(defaultProfile.defaultStartTime);
      setEndTime(defaultProfile.defaultEndTime);
      setWorkIntensity(defaultProfile.defaultIntensity);
      setShadeAvailability(defaultProfile.defaultShade);
      setWorkSetting(defaultProfile.defaultSetting);
      setIndoorTasksAvailable(defaultProfile.indoorTasksFeasible);
      setBreakPreferenceMinutes(15);
      showToast('Planner form reset to Chennai maintenance defaults.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold uppercase tracking-wider">
            <CalendarClock className="w-4 h-4" />
            <span>Interactive Decision Support</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-charcoal-900 mt-1">
            Climate-Adaptive Shift Planner
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Configure worksite parameters to automatically restructure outdoor shifts away from peak thermal hazards.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="gt-btn-secondary text-xs flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-charcoal-400" />
          <span>Reset Form Defaults</span>
        </button>
      </div>

      {/* Main Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (5 cols) */}
        <div className="lg:col-span-5 gt-card p-5 space-y-5">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Step 1: Location */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2">
                1. Location & Worksite Market
              </label>
              <div className="relative">
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="gt-input pl-9 font-medium"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}, {loc.state} ({loc.country})
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-forest-700 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Step 2: Worker Profile */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2">
                2. Workforce Crew Profile
              </label>
              <div className="grid grid-cols-1 gap-2">
                {profiles.map((p) => {
                  const isSelected = p.id === profileId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProfileSelect(p.id)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-forest-700 bg-forest-50/80 ring-1 ring-forest-700'
                          : 'border-charcoal-200 bg-white hover:bg-charcoal-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-forest-900' : 'text-charcoal-900'}`}>
                          {p.title}
                        </span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-forest-700" />}
                      </div>
                      <p className="text-[11px] text-charcoal-500 mt-1 leading-snug">
                        {p.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Shift Hours */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2">
                3. Shift Boundaries
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-charcoal-500 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="gt-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-charcoal-500 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="gt-input font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Worksite Factors */}
            <div className="space-y-3 pt-1 border-t border-charcoal-100">
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                4. Operational & Worksite Parameters
              </label>

              {/* Intensity */}
              <div>
                <label className="block text-[11px] font-medium text-charcoal-600 mb-1.5">
                  Physical Work Intensity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'moderate', 'heavy'] as WorkIntensity[]).map((intensity) => (
                    <button
                      key={intensity}
                      type="button"
                      onClick={() => setWorkIntensity(intensity)}
                      className={`py-2 px-2 text-xs font-medium rounded-xl border capitalize transition-all ${
                        workIntensity === intensity
                          ? 'bg-forest-800 text-white border-forest-800'
                          : 'bg-white text-charcoal-700 border-charcoal-300 hover:bg-charcoal-50'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shade */}
              <div>
                <label className="block text-[11px] font-medium text-charcoal-600 mb-1.5">
                  Worksite Shade Availability
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['good', 'partial', 'limited'] as ShadeAvailability[]).map((shade) => (
                    <button
                      key={shade}
                      type="button"
                      onClick={() => setShadeAvailability(shade)}
                      className={`py-2 px-2 text-xs font-medium rounded-xl border capitalize transition-all ${
                        shadeAvailability === shade
                          ? 'bg-forest-800 text-white border-forest-800'
                          : 'bg-white text-charcoal-700 border-charcoal-300 hover:bg-charcoal-50'
                      }`}
                    >
                      {shade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Setting */}
              <div>
                <label className="block text-[11px] font-medium text-charcoal-600 mb-1.5">
                  Worksite Exposure Setting
                </label>
                <select
                  value={workSetting}
                  onChange={(e) => setWorkSetting(e.target.value as WorkSetting)}
                  className="gt-input text-xs"
                >
                  <option value="mostly_outdoors">Mostly Outdoors (Standard Roadway/Field)</option>
                  <option value="mostly_exposed">Mostly Exposed (Unshaded Structural/Roof/Field)</option>
                  <option value="mixed_indoor_outdoor">Mixed Indoor / Outdoor (Periodic Canopy)</option>
                </select>
              </div>

              {/* Indoor Task Availability Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-50 border border-charcoal-200">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-forest-700 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-charcoal-900 block">
                      Indoor Tasks Feasible?
                    </span>
                    <span className="text-[10px] text-charcoal-500">
                      Allows moving sorting, staging, or prep indoors during peak sun.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={indoorTasksAvailable}
                  onChange={(e) => setIndoorTasksAvailable(e.target.checked)}
                  className="w-4 h-4 text-forest-700 rounded border-charcoal-300 focus:ring-forest-600 cursor-pointer"
                />
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={generating}
              className="gt-btn-primary w-full py-3 text-sm font-semibold shadow-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{generating ? 'Calculating Thermal Curve...' : 'Generate Shift Plan'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Generated Plan View (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!plan ? (
            <div className="gt-card p-10 text-center border-dashed border-charcoal-300">
              <CalendarClock className="w-12 h-12 text-forest-600/70 mx-auto mb-3" />
              <h3 className="text-base font-bold text-charcoal-900 mb-1">
                Ready to Generate Adaptive Schedule
              </h3>
              <p className="text-xs text-charcoal-500 max-w-md mx-auto mb-6 leading-relaxed">
                Review the worksite configuration on the left and click <strong>Generate Shift Plan</strong> to produce an optimized, weather-informed shift itinerary.
              </p>
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="gt-btn-primary text-xs"
              >
                <span>Generate Shift Plan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Plan Summary Card */}
              <div className="gt-card p-5 bg-gradient-to-br from-white to-forest-50/30 border-forest-200">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-2 py-0.5 rounded">
                      Generated Shift Itinerary
                    </span>
                    <h2 className="text-lg font-bold text-charcoal-900 mt-1">
                      {plan.name}
                    </h2>
                    <p className="text-xs text-charcoal-500">
                      Location: {plan.location.name} • {plan.request.startTime} to {plan.request.endTime} ({plan.summary.totalShiftHours} hrs)
                    </p>
                  </div>
                  <HeatRiskBadge category={plan.summary.overallRisk} size="md" />
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-charcoal-100 text-center">
                  <div className="p-2">
                    <span className="text-[10px] uppercase text-charcoal-400 font-semibold block">Peak Thermal Window</span>
                    <span className="text-xs font-bold text-charcoal-900 font-mono mt-0.5 block">
                      {plan.summary.peakHeatWindow}
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-[10px] uppercase text-charcoal-400 font-semibold block">Peak Feels-Like</span>
                    <span className="text-xs font-bold text-rose-600 font-mono mt-0.5 block">
                      {plan.summary.maxApparentTemperature}°C
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-[10px] uppercase text-charcoal-400 font-semibold block">Shaded Rest Breaks</span>
                    <span className="text-xs font-bold text-teal-700 font-mono mt-0.5 block">
                      {plan.summary.totalRestBreakMinutes} mins
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-[10px] uppercase text-charcoal-400 font-semibold block">Indoor Task Shift</span>
                    <span className="text-xs font-bold text-indigo-700 font-mono mt-0.5 block">
                      {plan.summary.indoorWorkHours} hrs
                    </span>
                  </div>
                </div>

                {/* Save Plan Section */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={planSaveName}
                      onChange={(e) => setPlanSaveName(e.target.value)}
                      placeholder="Name this plan..."
                      className="gt-input py-1.5 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSavePlan}
                      disabled={isSaving}
                      className="gt-btn-primary py-1.5 px-3.5 text-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Plan'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/app/plans')}
                      className="gt-btn-secondary py-1.5 px-3 text-xs"
                    >
                      <span>View All Plans</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Explainable Decisions & Recommendations */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-forest-700" />
                  <span>Explainable Supervisor Recommendations</span>
                </h3>
                <div className="space-y-2.5">
                  {plan.recommendations.map((rec) => (
                    <RecommendationCard
                      key={rec.title}
                      title={rec.title}
                      description={rec.description}
                      severity={rec.severity}
                      category={rec.category}
                    />
                  ))}
                </div>
              </div>

              {/* Chronological Schedule Blocks */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-forest-700" />
                  <span>Shift Timeline Itinerary ({plan.schedule.length} Blocks)</span>
                </h3>
                <div className="space-y-3">
                  {plan.schedule.map((block, idx) => (
                    <ScheduleBlockCard
                      key={block.id}
                      block={block}
                      stepNumber={idx + 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
