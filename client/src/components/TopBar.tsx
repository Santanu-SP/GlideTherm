import React from 'react';
import { LocationInfo } from '../types/index.js';
import { DataSourceBadge } from './DataSourceBadge.js';
import {
  MapPin,
  Calendar,
  Menu,
} from 'lucide-react';

interface TopBarProps {
  locations: LocationInfo[];
  selectedLocationId: string;
  onLocationChange: (id: string) => void;
  retrievedAt?: string;
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  locations,
  selectedLocationId,
  onLocationChange,
  retrievedAt,
  onOpenMobileMenu,
}) => {
  // Format current display date (e.g. "Sunday, 11 Oct 2026")
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-charcoal-200/80 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 focus:outline-none"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Location Selector */}
        <div className="flex items-center gap-1.5 bg-charcoal-50 border border-charcoal-200/80 rounded-xl px-2.5 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
          <select
            value={selectedLocationId}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-charcoal-900 focus:outline-none cursor-pointer"
            aria-label="Select city forecast"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}, {loc.state}
              </option>
            ))}
          </select>
        </div>

        {/* Current Date */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-charcoal-500 font-medium px-2 py-1">
          <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Meteorological Forecast Provider Indicator */}
        <DataSourceBadge retrievedAt={retrievedAt} />
      </div>
    </header>
  );
};
