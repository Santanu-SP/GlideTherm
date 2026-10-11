import React from 'react';
import { Radio, Database, ExternalLink } from 'lucide-react';

interface DataSourceBadgeProps {
  isSimulatedData: boolean;
  dataSourceLabel?: string;
  onToggleDemo?: () => void;
  retrievedAt?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  isSimulatedData,
  dataSourceLabel,
  onToggleDemo,
  retrievedAt,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {isSimulatedData ? (
        <span
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 font-medium text-amber-900"
          title="Displaying controlled demonstration scenario"
        >
          <Database className="w-3.5 h-3.5 text-amber-600" />
          <span>Demo Data Scenario</span>
        </span>
      ) : (
        <span
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-900"
          title="Active Open-Meteo hourly meteorological forecast"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Radio className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Forecast</span>
        </span>
      )}

      {onToggleDemo && (
        <button
          onClick={onToggleDemo}
          className="rounded-lg border border-charcoal-200 bg-white px-2 py-1 text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900 transition-colors"
          title="Switch between live meteorological fetch and deterministic demo scenario"
        >
          {isSimulatedData ? 'Switch to Live Forecast' : 'Use Demo Data'}
        </button>
      )}

      <a
        href="https://open-meteo.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[11px] text-charcoal-500 hover:text-forest-700 underline decoration-charcoal-300 underline-offset-2"
        title="Open-Meteo weather API documentation"
      >
        <span>Weather by Open-Meteo</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
