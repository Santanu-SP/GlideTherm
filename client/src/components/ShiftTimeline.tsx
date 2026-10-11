import React, { useState } from 'react';
import { HourlyAssessment } from '../types/index.js';
import { HeatRiskBadge } from './HeatRiskBadge.js';

interface ShiftTimelineProps {
  timeline: HourlyAssessment[];
  shiftStartHour?: number;
  shiftEndHour?: number;
}

export const ShiftTimeline: React.FC<ShiftTimelineProps> = ({
  timeline,
  shiftStartHour = 9,
  shiftEndHour = 17,
}) => {
  const [selectedHour, setSelectedHour] = useState<HourlyAssessment | null>(null);

  // Map category to bar background
  const getBarColor = (category: string) => {
    switch (category) {
      case 'lower_relative_concern':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'elevated_caution':
        return 'bg-amber-400 hover:bg-amber-500';
      case 'high_caution':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'severe_heat_advisory':
        return 'bg-rose-500 hover:bg-rose-600';
      default:
        return 'bg-charcoal-300';
    }
  };

  const activeHour = selectedHour || timeline.find(t => t.hour === 13) || timeline[12];

  return (
    <div className="gt-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-charcoal-900">
            Thermal Risk Distribution & Shift Timeline
          </h3>
          <p className="text-xs text-charcoal-500">
            Hourly progression showing shift boundaries and heat load. Click any bar for details.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-charcoal-600">Favourable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-charcoal-600">Elevated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-charcoal-600">High Caution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-charcoal-600">Severe Advisory</span>
          </div>
        </div>
      </div>

      {/* Timeline Bars */}
      <div className="relative pt-6 pb-2">
        {/* Shift bracket indicator */}
        <div
          className="absolute top-0 rounded-t border-t-2 border-forest-600 bg-forest-50/60 text-[10px] font-semibold text-forest-800 px-2 py-0.5 flex items-center justify-between pointer-events-none"
          style={{
            left: `${(shiftStartHour / 24) * 100}%`,
            width: `${((shiftEndHour - shiftStartHour) / 24) * 100}%`,
          }}
        >
          <span>Shift Start ({shiftStartHour}:00)</span>
          <span>Shift End ({shiftEndHour}:00)</span>
        </div>

        <div
          className="grid grid-cols-24 gap-1 h-14 items-end pt-3"
          style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
        >
          {timeline.map((point) => {
            const isInsideShift = point.hour >= shiftStartHour && point.hour < shiftEndHour;
            const isSelected = activeHour?.hour === point.hour;

            return (
              <button
                key={point.hour}
                type="button"
                onClick={() => setSelectedHour(point)}
                className={`relative flex flex-col justify-end h-full rounded transition-all focus:outline-none ${
                  isInsideShift ? 'ring-1 ring-forest-700/40' : 'opacity-65'
                } ${isSelected ? 'ring-2 ring-forest-900 scale-105 z-10' : ''}`}
                title={`${point.hour}:00 — ${point.temperature}°C (Feels like ${point.apparentTemperature}°C)`}
              >
                <div
                  className={`w-full rounded-t transition-all ${getBarColor(point.category)}`}
                  style={{ height: `${Math.max(20, Math.min(100, point.heatStrainIndex))}%` }}
                />
              </button>
            );
          })}
        </div>

        {/* Hour markers */}
        <div className="grid grid-cols-6 text-[10px] text-charcoal-400 mt-2 font-mono">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
        </div>
      </div>

      {/* Selected Hour Detail Tray */}
      {activeHour && (
        <div className="mt-4 p-3.5 bg-charcoal-50 rounded-xl border border-charcoal-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm text-charcoal-900">
              {activeHour.hour.toString().padStart(2, '0')}:00
            </span>
            <HeatRiskBadge category={activeHour.category} size="sm" score={activeHour.heatStrainIndex} />
            <span className="text-charcoal-600">
              Air: <strong>{activeHour.temperature}°C</strong>
            </span>
            <span className="text-charcoal-600">
              Feels: <strong>{activeHour.apparentTemperature}°C</strong>
            </span>
            <span className="text-charcoal-500">
              Humidity: <strong>{activeHour.relativeHumidity}%</strong>
            </span>
            {activeHour.solarRadiation !== undefined && (
              <span className="text-charcoal-500">
                Solar: <strong>{activeHour.solarRadiation} W/m²</strong>
              </span>
            )}
          </div>
          <div className="text-charcoal-700 font-medium italic">
            "{activeHour.recommendedAction}"
          </div>
        </div>
      )}
    </div>
  );
};
