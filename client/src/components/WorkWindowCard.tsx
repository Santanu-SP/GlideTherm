import React from 'react';
import { BestWorkWindow } from '../types/index.js';
import { HeatRiskBadge } from './HeatRiskBadge.js';
import { Clock, Thermometer, Sparkles } from 'lucide-react';

interface WorkWindowCardProps {
  window: BestWorkWindow;
  rank?: number;
}

export const WorkWindowCard: React.FC<WorkWindowCardProps> = ({ window, rank = 1 }) => {
  return (
    <div className="gt-card p-4 relative overflow-hidden flex flex-col justify-between border-forest-100 hover:border-forest-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-forest-100 text-forest-800 text-xs font-bold">
            #{rank}
          </span>
          <div className="flex items-center gap-1.5 font-semibold text-charcoal-900 text-base">
            <Clock className="w-4 h-4 text-forest-700" />
            <span>{window.startTime} – {window.endTime}</span>
            <span className="text-xs font-normal text-charcoal-500">
              ({window.durationHours}h)
            </span>
          </div>
        </div>
        <HeatRiskBadge category={window.category} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-2 my-2 py-2 border-y border-charcoal-100 text-xs">
        <div className="flex items-center gap-1.5 text-charcoal-600">
          <Thermometer className="w-3.5 h-3.5 text-charcoal-400" />
          <span>Avg Air: <strong>{window.avgTemperature}°C</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-charcoal-600">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          <span>Feels like: <strong>{window.avgApparentTemperature}°C</strong></span>
        </div>
      </div>

      <p className="text-xs font-medium text-forest-900 mb-1">
        {window.recommendedUse}
      </p>

      <p className="text-[11px] text-charcoal-500 leading-relaxed">
        {window.rationale}
      </p>
    </div>
  );
};
