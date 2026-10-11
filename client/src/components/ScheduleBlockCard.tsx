import React from 'react';
import { ScheduleBlock } from '../types/index.js';
import { HeatRiskBadge } from './HeatRiskBadge.js';
import {
  Clock,
  Briefcase,
  Home,
  Coffee,
  AlertCircle,
  Users,
  MapPin,
} from 'lucide-react';

interface ScheduleBlockCardProps {
  block: ScheduleBlock;
  stepNumber: number;
}

export const ScheduleBlockCard: React.FC<ScheduleBlockCardProps> = ({ block, stepNumber }) => {
  const typeConfig = {
    shift_briefing: {
      label: 'Shift Briefing',
      icon: Users,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      borderLeft: 'border-l-blue-500',
    },
    core_outdoor_work: {
      label: 'Core Outdoor Work',
      icon: Briefcase,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      borderLeft: 'border-l-emerald-600',
    },
    indoor_task_alternative: {
      label: 'Indoor Task Shift',
      icon: Home,
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      borderLeft: 'border-l-indigo-600',
    },
    hydration_rest_break: {
      label: 'Hydration & Rest Break',
      icon: Coffee,
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
      borderLeft: 'border-l-teal-500',
    },
    heat_review_checkpoint: {
      label: 'Heat Review Checkpoint',
      icon: AlertCircle,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      borderLeft: 'border-l-amber-500',
    },
  };

  const config = typeConfig[block.type] || typeConfig.core_outdoor_work;
  const TypeIcon = config.icon;

  const locationContextLabel = {
    outdoor: 'Outdoor Worksite',
    indoor: 'Indoor / Shaded Bay',
    shaded_area: 'Designated Shaded Canopy',
  }[block.locationContext] || 'Worksite';

  return (
    <div className={`gt-card p-4 border-l-4 ${config.borderLeft} relative transition-all hover:translate-x-0.5`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-charcoal-100 text-charcoal-700 text-xs font-bold font-mono">
            {stepNumber.toString().padStart(2, '0')}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-bold font-mono text-sm text-charcoal-900">
                <Clock className="w-3.5 h-3.5 text-charcoal-500" />
                {block.startTime} – {block.endTime}
              </span>

              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${config.badgeClass}`}>
                <TypeIcon className="w-3 h-3" />
                <span>{config.label}</span>
              </span>
            </div>

            <h4 className="text-sm font-semibold text-charcoal-900 mt-1">
              {block.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-charcoal-500 bg-charcoal-50 px-2 py-0.5 rounded border border-charcoal-200">
            <MapPin className="w-3 h-3 text-charcoal-400" />
            {locationContextLabel}
          </span>
          <HeatRiskBadge category={block.riskCategory} size="sm" />
        </div>
      </div>

      <p className="text-xs text-charcoal-600 mb-2 leading-relaxed pl-10">
        {block.description}
      </p>

      {block.guidance && (
        <div className="ml-10 p-2.5 rounded-lg bg-charcoal-50 border border-charcoal-200/60 text-[11px] text-charcoal-700 flex items-start gap-2">
          <span className="font-semibold text-forest-800 uppercase tracking-wider text-[10px] shrink-0 mt-0.5">
            Supervisor Action:
          </span>
          <span>{block.guidance}</span>
        </div>
      )}
    </div>
  );
};
