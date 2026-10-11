import React from 'react';
import { RiskCategory } from '../types/index.js';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

interface HeatRiskBadgeProps {
  category: RiskCategory;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const HeatRiskBadge: React.FC<HeatRiskBadgeProps> = ({
  category,
  score,
  size = 'md',
  showIcon = true,
}) => {
  const configs = {
    lower_relative_concern: {
      label: 'Lower Relative Concern',
      shortLabel: 'Favourable',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
    },
    elevated_caution: {
      label: 'Elevated Caution',
      shortLabel: 'Elevated',
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    high_caution: {
      label: 'High Caution',
      shortLabel: 'High Caution',
      bg: 'bg-orange-50 border-orange-200 text-orange-800',
      icon: AlertOctagon,
      iconColor: 'text-orange-600',
    },
    severe_heat_advisory: {
      label: 'Severe Heat Advisory',
      shortLabel: 'Advisory',
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: Flame,
      iconColor: 'text-rose-600',
    },
  };

  const config = configs[category] || configs.lower_relative_concern;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses[size]}`}
      title={config.label}
    >
      {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor} shrink-0`} />}
      <span>{size === 'sm' ? config.shortLabel : config.label}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono text-[10px] ml-0.5">
          ({score})
        </span>
      )}
    </span>
  );
};
