import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Logo } from './Logo.js';
import {
  LayoutDashboard,
  CalendarClock,
  SunMedium,
  CheckSquare,
  Bookmark,
  Info,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navItems = [
    { to: '/app', label: 'Operational Overview', icon: LayoutDashboard },
    { to: '/app/planner', label: 'Shift Planner', icon: CalendarClock },
    { to: '/app/outlook', label: 'Hourly Heat Outlook', icon: SunMedium },
    { to: '/app/safety', label: 'Crew Safety Checklist', icon: CheckSquare },
    { to: '/app/plans', label: 'Saved Shift Plans', icon: Bookmark },
    { to: '/app/about', label: 'Methodology & Ethics', icon: Info },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-charcoal-200/80 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-charcoal-100">
          <Link to="/" onClick={onCloseMobile} className="block focus:outline-none">
            <Logo size="md" showTagline />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-forest-800 text-white shadow-sm font-semibold'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Operational Status & Responsibility Notice */}
      <div className="p-4 border-t border-charcoal-100 space-y-3">
        <div className="rounded-lg bg-charcoal-50 p-2.5 text-[10px] text-charcoal-500 flex items-start gap-1.5 leading-snug">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>Operational decision support. Always follow statutory occupational safety standards.</span>
        </div>

        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center justify-between text-xs text-charcoal-500 hover:text-forest-700 px-2 py-1 font-medium transition-colors"
        >
          <span>Product Overview</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
};
