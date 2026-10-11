import React from 'react';
import { Radio, ExternalLink } from 'lucide-react';

interface DataSourceBadgeProps {
  retrievedAt?: string;
  dataSourceLabel?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  retrievedAt,
  dataSourceLabel = 'Open-Meteo Forecast',
}) => {
  const formattedTime = retrievedAt
    ? new Date(retrievedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-900"
        title="Hourly meteorological forecast provided by Open-Meteo"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Radio className="w-3.5 h-3.5 text-emerald-600" />
        <span>Hourly Forecast</span>
      </span>

      {formattedTime && (
        <span className="hidden sm:inline text-[11px] text-charcoal-400 font-mono">
          Updated {formattedTime}
        </span>
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
