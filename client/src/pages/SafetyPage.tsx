import React, { useState, useEffect } from 'react';
import { useApp } from '../components/AppShell.js';
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Users,
  Clock,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'before_shift' | 'during_shift' | 'supervisor_actions';
  title: string;
  description: string;
  priority: 'critical' | 'required' | 'recommended';
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Before shift
  {
    id: 'bs-1',
    category: 'before_shift',
    title: 'Review Official Local Meteorological Warnings',
    description: 'Check IMD (India Meteorological Department) or local municipal heat bulletins before dispatching field crews.',
    priority: 'critical',
  },
  {
    id: 'bs-2',
    category: 'before_shift',
    title: 'Inspect Potable Water Supply & Hydration Stations',
    description: 'Ensure a minimum of 4–5 litres of cool, clean drinking water is accessible per worker at or near active worksite points.',
    priority: 'critical',
  },
  {
    id: 'bs-3',
    category: 'before_shift',
    title: 'Verify Shaded Recovery Areas & Pop-Up Canopies',
    description: 'Confirm presence of covered, well-ventilated rest zones out of direct midday solar radiation.',
    priority: 'required',
  },
  {
    id: 'bs-4',
    category: 'before_shift',
    title: 'Designate Indoor Alternative Tasks',
    description: 'Identify equipment maintenance, sorting, or administrative duties that can be undertaken if thermal threshold is exceeded.',
    priority: 'recommended',
  },
  // During shift
  {
    id: 'ds-1',
    category: 'during_shift',
    title: 'Enforce Mandatory 15-20 Min Shaded Rest Intervals',
    description: 'During elevated caution hours, ensure workers rotate into shade for active metabolic recovery.',
    priority: 'critical',
  },
  {
    id: 'ds-2',
    category: 'during_shift',
    title: 'Operate Buddy System for Early Symptom Monitoring',
    description: 'Pair workers to watch for confusion, dizziness, slurred speech, cessation of sweating, or severe fatigue.',
    priority: 'critical',
  },
  {
    id: 'ds-3',
    category: 'during_shift',
    title: 'Provide Electrolyte Replenishment (ORS / Salt-Sugar Solutions)',
    description: 'Offer oral rehydration salts alongside fresh water to counteract sodium depletion from heavy sweating.',
    priority: 'required',
  },
  {
    id: 'ds-4',
    category: 'during_shift',
    title: 'Maintain Breathable, High-Visibility Work Apparel',
    description: 'Wear lightweight cotton or moisture-wicking certified PPE; use wide-brim neck shades where compatible with hard hats.',
    priority: 'recommended',
  },
  // Supervisor actions
  {
    id: 'sa-1',
    category: 'supervisor_actions',
    title: 'Conduct Morning Crew Heat Briefing (10-15 mins)',
    description: 'Review forecast temperature milestones with crew and clarify emergency cooling protocols before start.',
    priority: 'critical',
  },
  {
    id: 'sa-2',
    category: 'supervisor_actions',
    title: 'Execute Midday Task Reassessment Checkpoint',
    description: 'Evaluate peak conditions around 12:00-14:00; halt non-essential heavy excavation or unshaded roof work if HSI is elevated.',
    priority: 'critical',
  },
  {
    id: 'sa-3',
    category: 'supervisor_actions',
    title: 'Establish Emergency Rapid-Response Protocol',
    description: 'Pre-identify worksite first-aid responder, chilled ice pack locations, and nearest municipal clinic contact.',
    priority: 'critical',
  },
];

const STORAGE_KEY = 'glidetherm_safety_checklist';

export const SafetyPage: React.FC = () => {
  const { showToast } = useApp();
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['bs-1', 'bs-2', 'sa-1'];
    } catch {
      return ['bs-1', 'bs-2', 'sa-1'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch (err) {
      console.error(err);
    }
  }, [completedIds]);

  const toggleItem = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetChecklist = () => {
    setCompletedIds(['bs-1', 'bs-2', 'sa-1']);
    showToast('Checklist progress reset to standard morning default.', 'info');
  };

  const totalItems = DEFAULT_CHECKLIST.length;
  const completedCount = completedIds.length;
  const progressPercent = Math.round((completedCount / totalItems) * 100);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">Critical</span>;
      case 'required':
        return <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Required</span>;
      default:
        return <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">Recommended</span>;
    }
  };

  const categories = [
    { key: 'before_shift', label: 'A. Pre-Shift Readiness', icon: Clock },
    { key: 'during_shift', label: 'B. Active Shift Protocols', icon: Users },
    { key: 'supervisor_actions', label: 'C. Supervisor Oversight & Emergency', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" />
            <span>Operational Protocols</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-charcoal-900 mt-1">
            Workforce Heat Safety Checklist
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Practical, field-verified readiness checklist for supervisors managing outdoor crews during extreme heat.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetChecklist}
          className="gt-btn-secondary text-xs flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-charcoal-400" />
          <span>Reset Checklist</span>
        </button>
      </div>

      {/* Progress Overview Card */}
      <div className="gt-card p-5 bg-gradient-to-r from-white to-forest-50/50 border-forest-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-xs font-semibold text-charcoal-700">
              Shift Readiness Status
            </span>
            <div className="text-xl font-bold text-charcoal-900 mt-0.5">
              {completedCount} of {totalItems} Checks Completed ({progressPercent}%)
            </div>
          </div>

          <div className="flex items-center gap-2">
            {progressPercent === 100 ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fully Prepared for Shift</span>
              </span>
            ) : (
              <span className="text-xs text-charcoal-500 font-medium">
                {totalItems - completedCount} pending action items
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-charcoal-200/70 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-forest-700 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const items = DEFAULT_CHECKLIST.filter((i) => i.category === cat.key);
          const CatIcon = cat.icon;

          return (
            <div key={cat.key} className="gt-card p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-charcoal-100">
                <CatIcon className="w-4 h-4 text-forest-700" />
                <h2 className="text-sm font-bold text-charcoal-900">
                  {cat.label}
                </h2>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const isChecked = completedIds.includes(item.id);

                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-white border-charcoal-200 hover:bg-charcoal-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(item.id)}
                        className="w-4 h-4 mt-0.5 text-forest-700 rounded border-charcoal-300 focus:ring-forest-600 cursor-pointer shrink-0"
                      />

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-xs font-semibold ${
                              isChecked
                                ? 'text-emerald-900 line-through opacity-85'
                                : 'text-charcoal-900'
                            }`}
                          >
                            {item.title}
                          </span>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className="text-[11px] text-charcoal-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Guidance Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="block font-semibold mb-0.5">Heat Illness Emergency Protocol:</strong>
          If a worker exhibits signs of heat stroke (hot dry skin, high body temperature, confusion, loss of consciousness), immediately move them to cold shade, loosen restrictive clothing, apply cold water/ice to neck and armpits, and summon emergency medical personnel immediately.
        </div>
      </div>
    </div>
  );
};
