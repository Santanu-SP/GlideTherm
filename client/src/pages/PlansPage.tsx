import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../components/AppShell.js';
import { ApiService } from '../services/api.js';
import { ShiftPlan } from '../types/index.js';
import { HeatRiskBadge } from '../components/HeatRiskBadge.js';
import { ConfirmationDialog } from '../components/ConfirmationDialog.js';
import {
  Bookmark,
  Search,
  Calendar,
  Clock,
  Trash2,
  ExternalLink,
  PlusCircle,
  MapPin,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react';

export const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [plans, setPlans] = useState<ShiftPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [planToDelete, setPlanToDelete] = useState<ShiftPlan | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getSavedPlans();
      setPlans(data);
    } catch {
      showToast('Failed to load saved plans', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    try {
      const success = await ApiService.deletePlan(planToDelete.id);
      if (success) {
        setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
        showToast(`Plan "${planToDelete.name}" deleted.`, 'info');
      } else {
        showToast('Could not delete plan', 'warning');
      }
    } catch {
      showToast('Error deleting plan', 'warning');
    } finally {
      setPlanToDelete(null);
    }
  };

  const handleOpenPlan = (p: ShiftPlan) => {
    navigate('/app/planner', { state: { loadedPlan: p } });
  };

  const filteredPlans = plans.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.location.name.toLowerCase().includes(q) ||
      p.request.profileId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold uppercase tracking-wider">
            <Bookmark className="w-4 h-4" />
            <span>Shift Repository</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-charcoal-900 mt-1">
            Saved Shift Plans
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Review, reopen, and manage previously calculated climate-adaptive shift plans.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/planner')}
          className="gt-btn-primary text-xs flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Shift</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="gt-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans by crew name, location, or schedule..."
            className="gt-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-44 bg-charcoal-200/50 rounded-2xl" />
          <div className="h-44 bg-charcoal-200/50 rounded-2xl" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="gt-card p-12 text-center border-dashed border-charcoal-300">
          <CalendarClock className="w-12 h-12 text-charcoal-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-charcoal-900 mb-1">
            {searchQuery ? 'No Matching Plans Found' : 'No Saved Shift Plans Yet'}
          </h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-5 leading-relaxed">
            {searchQuery
              ? 'Try adjusting your search query or reset the search filter.'
              : 'Generate an adaptive schedule using the shift planner and click Save to store it here.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/app/planner')}
            className="gt-btn-primary text-xs"
          >
            <span>Create Shift Plan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map((p) => {
            const createdDate = new Date(p.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={p.id}
                className="gt-card p-5 flex flex-col justify-between hover:border-forest-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-charcoal-900">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-forest-800">
                          <MapPin className="w-3.5 h-3.5 text-forest-700" />
                          {p.location.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {p.request.date || createdDate}
                        </span>
                      </div>
                    </div>
                    <HeatRiskBadge category={p.summary.overallRisk} size="sm" />
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-charcoal-100 text-xs">
                    <div>
                      <span className="text-[10px] text-charcoal-400 block font-semibold">Shift Hours</span>
                      <span className="font-mono font-bold text-charcoal-900">
                        {p.request.startTime}–{p.request.endTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal-400 block font-semibold">Peak Feels-Like</span>
                      <span className="font-mono font-bold text-rose-600">
                        {p.summary.maxApparentTemperature}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal-400 block font-semibold">Blocks</span>
                      <span className="font-mono font-bold text-teal-700">
                        {p.schedule.length} Segments
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-charcoal-600 line-clamp-2 mb-3">
                    {p.recommendations[0]?.description || 'Adaptive shift configured for worksite safety.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-charcoal-100 text-xs">
                  <span className="text-[10px] text-charcoal-400 font-mono">
                    Created: {createdDate}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlanToDelete(p)}
                      className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete saved plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPlan(p)}
                      className="gt-btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
                    >
                      <span>Open Plan</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationDialog
        isOpen={Boolean(planToDelete)}
        title="Delete Shift Plan?"
        message={`Are you sure you want to permanently delete "${planToDelete?.name}"? This action removes the saved record from persistent storage.`}
        confirmLabel="Delete Plan"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPlanToDelete(null)}
      />
    </div>
  );
};
