import React from 'react';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface RecommendationCardProps {
  title: string;
  description: string;
  severity: 'info' | 'caution' | 'warning';
  category: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  severity,
  category,
}) => {
  const configs = {
    warning: {
      bg: 'bg-rose-50/70 border-rose-200 text-rose-900',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
    },
    caution: {
      bg: 'bg-amber-50/70 border-amber-200 text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    info: {
      bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: Info,
      iconColor: 'text-emerald-600',
    },
  };

  const config = configs[severity] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-4 ${config.bg} flex items-start gap-3.5 transition-all`}>
      <div className="shrink-0 mt-0.5">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${config.badge}`}>
            {category}
          </span>
          <h4 className="font-semibold text-xs text-charcoal-900">
            {title}
          </h4>
        </div>

        <p className="text-xs text-charcoal-700 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
