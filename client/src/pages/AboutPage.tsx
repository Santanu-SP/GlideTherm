import React from 'react';
import {
  Info,
  ShieldCheck,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Droplets,
  Scale,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold uppercase tracking-wider">
          <Info className="w-4 h-4" />
          <span>Product Architecture & Ethics</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-charcoal-900 mt-1">
          About GlideTherm
        </h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Beat the heat. Plan smarter shifts. Technical foundations, environmental focus, and responsible AI disclosures.
        </p>
      </div>

      {/* Core Mission */}
      <div className="gt-card p-6 bg-gradient-to-br from-white to-forest-50/40 border-forest-200">
        <h2 className="text-base font-bold text-charcoal-900 mb-2">
          Environmental Track: Heat and Water
        </h2>
        <p className="text-xs text-charcoal-700 leading-relaxed mb-4">
          Outdoor workforces in rapidly warming urban centers face intensifying heat stress. Traditional weather applications provide temperature observations, but fail to translate meteorological data into actionable worksite decisions. GlideTherm bridges this gap by transforming hourly forecasts into adaptive work-rest intervals, indoor task rotations, and crew hydration logistics.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-950 font-semibold mb-0.5">Heat Adaptation</strong>
              <p className="text-charcoal-600 text-[11px]">
                Restructures demanding physical labor around forecast solar irradiance and peak apparent heat indices.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 flex items-start gap-2.5">
            <Droplets className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-blue-950 font-semibold mb-0.5">Water & Hydration Logistics</strong>
              <p className="text-charcoal-600 text-[11px]">
                Calculates scheduled hydration intervals and shaded recovery checkpoints based on sweat evaporation potential.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meteorological Data Source & Attribution */}
      <div className="gt-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-forest-700" />
          <h2 className="text-sm font-bold text-charcoal-900">
            Weather Intelligence Provider
          </h2>
        </div>
        <p className="text-xs text-charcoal-600 leading-relaxed mb-3">
          GlideTherm integrates hourly meteorological forecasts from <strong>Open-Meteo</strong>, an open-source weather API providing high-resolution numerical weather prediction models without proprietary API keys.
        </p>
        <div className="p-3.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-charcoal-900 block">Attribution:</span>
            <span className="text-charcoal-500">"Weather data by Open-Meteo"</span>
          </div>
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="gt-btn-secondary text-xs flex items-center gap-1.5"
          >
            <span>Open-Meteo Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Heat Strain Index Heuristic */}
      <div className="gt-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-forest-700" />
          <h2 className="text-sm font-bold text-charcoal-900">
            GlideTherm Heat Strain Heuristic (HSI)
          </h2>
        </div>
        <p className="text-xs text-charcoal-600 leading-relaxed mb-3">
          Our calculation engine uses a deterministic algorithm that evaluates:
        </p>
        <ul className="list-disc list-inside text-xs text-charcoal-600 space-y-1 mb-4 pl-2">
          <li><strong>Ambient Air Temperature (°C)</strong>: Base thermal energy.</li>
          <li><strong>Apparent Temperature / Heat Index (°C)</strong>: Physiological temperature sensation.</li>
          <li><strong>Relative Humidity (%)</strong>: Evaporative sweat efficiency factor.</li>
          <li><strong>Direct Solar Radiation (W/m²)</strong>: Radiant heat absorbed on unshaded surfaces.</li>
          <li><strong>Metabolic Work Intensity</strong>: Internal heat generated by physical exertion (light, moderate, heavy).</li>
          <li><strong>Worksite Canopy Shade</strong>: Mitigation factor applied to radiant solar loading.</li>
        </ul>
        <div className="p-3 rounded-xl bg-forest-50 border border-forest-100 text-xs text-forest-900">
          <strong>Decision-Support Guarantee:</strong> All schedule calculations and recommendation rules are transparent, explainable, and fully deterministic.
        </div>
      </div>

      {/* Disclaimers & Ethics */}
      <div className="gt-card p-6 border-amber-200 bg-amber-50/20">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-charcoal-900">
            Responsible Use & Legal Disclaimers
          </h2>
        </div>
        <div className="text-xs text-charcoal-700 space-y-2 leading-relaxed">
          <p>
            • <strong>Operational Decision Support:</strong> GlideTherm is intended as an operational decision-support tool for worksite supervisors. It is NOT a medical diagnostic device, emergency dispatch system, or formal occupational safety certification.
          </p>
          <p>
            • <strong>WBGT Clarification:</strong> Calculations provided are internal heuristic estimates based on available numerical meteorological forecasts and do not represent physical black-globe Wet-Bulb Globe Temperature (WBGT) sensor readings.
          </p>
          <p>
            • <strong>Regulatory Precedence:</strong> Official weather advisories and warnings from meteorological authorities, governmental emergency declarations, and established workplace occupational safety standards always take precedence.
          </p>
          <p>
            • <strong>Privacy:</strong> GlideTherm does not collect worker personal medical history, individual biometric telemetry, or GPS location tracking. All shift plans are stored securely in backend persistent storage.
          </p>
        </div>
      </div>
    </div>
  );
};
