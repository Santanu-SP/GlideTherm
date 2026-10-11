import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/Logo.js';
import { HeatRiskBadge } from '../components/HeatRiskBadge.js';
import {
  CalendarClock,
  SunMedium,
  CheckSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Thermometer,
  Flame,
  Droplets,
  ExternalLink,
  ChevronRight,
  Layers,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas text-charcoal-900 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-charcoal-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="focus:outline-none">
            <Logo size="md" showTagline />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-charcoal-600">
            <a href="#problem" className="hover:text-forest-800 transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-forest-800 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-forest-800 transition-colors">Features</a>
            <a href="#environmental-track" className="hover:text-forest-800 transition-colors">Heat & Water</a>
            <Link to="/app/about" className="hover:text-forest-800 transition-colors">Methodology</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="gt-btn-secondary text-xs px-3.5 py-2 hidden sm:inline-flex"
            >
              <span>Open Dashboard</span>
            </button>
            <button
              onClick={() => navigate('/app/planner')}
              className="gt-btn-primary text-xs px-4 py-2"
            >
              <span>Plan Today's Shift</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-20 pb-16">
        {/* Hero Section */}
        <section className="pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 text-forest-900 border border-forest-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Climate-Adaptive Workforce Planning • Heat & Water Track</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-forest-950 leading-[1.1]">
              Plan the shift.<br />
              <span className="text-forest-600 font-bold">Not the heat.</span>
            </h1>

            <p className="text-sm sm:text-base text-charcoal-600 max-w-2xl mx-auto leading-relaxed">
              Turn hourly weather forecasts into practical outdoor work plans, helping teams identify challenging heat periods and organise work more thoughtfully before the hottest hours arrive.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => navigate('/app/planner')}
                className="gt-btn-primary text-sm px-6 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                <span>Plan Today's Shift</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/app')}
                className="gt-btn-secondary text-sm px-5 py-3 shadow-xs hover:bg-charcoal-50"
              >
                <span>Open Operations Dashboard</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Preview: Live Embedded GlideTherm Dashboard Mockup */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="gt-card p-6 md:p-8 bg-gradient-to-b from-white to-charcoal-50/70 border-forest-200/80 shadow-xl rounded-3xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-charcoal-200/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs">
                    LIVE APP PREVIEW
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-charcoal-900">
                      Chennai Municipal Maintenance Crew • Shift 09:00 – 17:00
                    </h2>
                    <p className="text-xs text-charcoal-500">
                      Real-time Open-Meteo meteorological feed with adaptive worksite scheduling
                    </p>
                  </div>
                </div>
                <HeatRiskBadge category="high_caution" size="md" score={76} />
              </div>

              {/* Sample Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-charcoal-200/80 text-xs">
                <div className="p-3 bg-white rounded-xl border border-charcoal-200">
                  <span className="text-charcoal-500 block text-[11px]">Current Temperature</span>
                  <span className="text-xl font-bold font-mono text-charcoal-900 mt-0.5 block">36.5°C</span>
                  <span className="text-[10px] text-charcoal-400">Peak 38.8°C at 13:00</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-charcoal-200">
                  <span className="text-charcoal-500 block text-[11px]">Apparent Heat Index</span>
                  <span className="text-xl font-bold font-mono text-rose-600 mt-0.5 block">44.5°C</span>
                  <span className="text-[10px] text-rose-500 font-medium">Elevated humidity load</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-charcoal-200">
                  <span className="text-charcoal-500 block text-[11px]">Best Work Window</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 mt-0.5 block">06:00 – 10:00</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Optimal outdoor duties</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-charcoal-200">
                  <span className="text-charcoal-500 block text-[11px]">Midday Recommendation</span>
                  <span className="text-xs font-bold text-indigo-700 mt-1 block">Shift Tasks Indoors</span>
                  <span className="text-[10px] text-charcoal-500">During peak 12:00–14:30</span>
                </div>
              </div>

              {/* Visual Shift Timeline Representation */}
              <div className="pt-6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-charcoal-800">Dynamic Shift Distribution</span>
                  <span className="text-charcoal-500 font-mono">09:00 — 17:00</span>
                </div>
                <div className="h-9 w-full rounded-xl overflow-hidden flex text-[10px] font-bold text-white shadow-inner">
                  <div className="w-[15%] bg-blue-600 flex items-center justify-center" title="09:00-09:15 Briefing">
                    Briefing
                  </div>
                  <div className="w-[30%] bg-emerald-600 flex items-center justify-center" title="09:15-11:30 Core Outdoor">
                    Core Outdoor Work
                  </div>
                  <div className="w-[30%] bg-indigo-600 flex items-center justify-center" title="11:30-14:00 Indoor Task Shift">
                    Indoor Task Shift
                  </div>
                  <div className="w-[10%] bg-teal-500 flex items-center justify-center" title="14:00-14:30 Shaded Rest">
                    Rest
                  </div>
                  <div className="w-[15%] bg-amber-500 flex items-center justify-center" title="14:30-17:00 Afternoon Wrapup">
                    Paced Work
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section A: The Problem */}
        <section id="problem" className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
              Why Weather Apps Aren't Enough
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
              A standard weather report says "37°C today." But for an outdoor crew supervisor, raw numbers leave the hardest questions unanswered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="gt-card p-6 border-rose-200 bg-rose-50/20">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2 mb-2">
                <span>The Conventional Weather Dilemma</span>
              </h3>
              <ul className="text-xs text-charcoal-600 space-y-2">
                <li>• No insight into physiological metabolic heat generated by heavy physical work.</li>
                <li>• Ignores worksite specifics such as direct solar exposure vs. canopy shade.</li>
                <li>• Doesn't identify when tasks could be shifted indoors or rotated.</li>
                <li>• Leaves supervisors guessing on break frequencies and hydration volume.</li>
              </ul>
            </div>

            <div className="gt-card p-6 border-emerald-200 bg-emerald-50/20">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>The GlideTherm Advantage</span>
              </h3>
              <ul className="text-xs text-charcoal-600 space-y-2">
                <li>• Combines forecast air temp, apparent index, humidity, and solar radiation.</li>
                <li>• Calculates occupation-aware heat strain based on crew exertion rate.</li>
                <li>• Generates chronological shift blocks with built-in indoor alternatives.</li>
                <li>• Supplies transparent supervisor recommendations and safety checklists.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section B: How It Works */}
        <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
              Three Steps to a Safer Shift
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
              From raw meteorological forecast to an actionable crew schedule in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="gt-card p-6 relative">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-forest-800 text-white font-mono font-bold text-sm mb-4">
                1
              </span>
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">
                Select City & Worksite
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Choose from major Indian urban centers including Chennai, Bengaluru, Delhi, Ahmedabad, and Hyderabad without needing GPS permissions.
              </p>
            </div>

            <div className="gt-card p-6 relative">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-forest-800 text-white font-mono font-bold text-sm mb-4">
                2
              </span>
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">
                Configure Crew Profile
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Select your workforce type (construction, sanitation, delivery, maintenance) and fine-tune physical intensity, shade coverage, and shift hours.
              </p>
            </div>

            <div className="gt-card p-6 relative">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-forest-800 text-white font-mono font-bold text-sm mb-4">
                3
              </span>
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">
                Generate Adaptive Shift
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Receive an explainable timeline with cooler outdoor work windows, indoor task rotations, scheduled shaded rest intervals, and checklists.
              </p>
            </div>
          </div>
        </section>

        {/* Section C: Features Grid */}
        <section id="features" className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
              Core Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
              Engineered for field supervisors, safety coordinators, and municipal managers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="gt-card p-5">
              <SunMedium className="w-5 h-5 text-amber-600 mb-3" />
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">Hourly Heat Outlook</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Interactive charts visualizing air temperature, apparent heat index, relative humidity, and solar radiation progression.
              </p>
            </div>

            <div className="gt-card p-5">
              <CalendarClock className="w-5 h-5 text-forest-700 mb-3" />
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">Adaptive Shift Planner</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Deterministic engine that restructures outdoor work blocks away from midday solar peaks into cooler morning and late afternoon slots.
              </p>
            </div>

            <div className="gt-card p-5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-3" />
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">Explainable Decisions</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Every recommendation clearly explains the meteorological and worksite factors driving the advice.
              </p>
            </div>

            <div className="gt-card p-5">
              <CheckSquare className="w-5 h-5 text-teal-600 mb-3" />
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">Crew Safety Checklist</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Structured pre-shift, during-shift, and supervisor oversight checks covering hydration access, buddy systems, and cooling protocols.
              </p>
            </div>

            <div className="gt-card p-5">
              <Layers className="w-5 h-5 text-indigo-600 mb-3" />
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">Saved Daily Plans</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Local-first persistence allowing supervisors to save, reopen, filter, and archive daily work itineraries.
              </p>
            </div>

            <div className="gt-card p-5">
              <Users className="w-5 h-5 text-charcoal-700 mb-3" />
              <h3 className="text-sm font-bold text-charcoal-900 mb-1">Occupation Profiles</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Pre-configured baseline defaults tailored to construction, municipal sanitation, delivery riders, vendors, and agriculture.
              </p>
            </div>
          </div>
        </section>

        {/* Section D: Environmental Track - Heat & Water */}
        <section id="environmental-track" className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-24">
          <div className="gt-card p-8 bg-gradient-to-br from-forest-900 to-forest-950 text-white rounded-3xl">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Environmental Track: Heat and Water
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Adapting Outdoor Labour to Climate Realities
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-200 leading-relaxed">
                As extreme seasonal heat events intensify across South Asia, traditional unadapted work schedules lead to severe occupational thermal strain. GlideTherm promotes climate adaptation by aligning heavy physical labor with the diurnal cycle, reducing peak exposure and optimizing worksite hydration logistics.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/app/planner')}
                  className="gt-btn-primary bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-semibold text-xs px-5 py-2.5"
                >
                  <span>Experience the Shift Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Responsible Use Disclaimer */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-charcoal-100/70 border border-charcoal-200 text-xs text-charcoal-600 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-forest-800 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-charcoal-900 block mb-1">Responsible Use Notice:</strong>
              GlideTherm is an environmental decision-support prototype. It does not replace official meteorological heat bulletins issued by national authorities, certified workplace occupational safety regulations, or qualified medical guidance. Never disregard symptoms of thermal distress.
            </div>
          </div>
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-charcoal-200 bg-white py-10 px-4 sm:px-6 lg:px-8 text-xs text-charcoal-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="border-l border-charcoal-200 pl-3">
              Beat the heat. Plan smarter shifts.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <Link to="/app" className="hover:text-forest-800 transition-colors">Overview</Link>
            <Link to="/app/planner" className="hover:text-forest-800 transition-colors">Shift Planner</Link>
            <Link to="/app/outlook" className="hover:text-forest-800 transition-colors">Hourly Outlook</Link>
            <Link to="/app/safety" className="hover:text-forest-800 transition-colors">Crew Safety</Link>
            <Link to="/app/about" className="hover:text-forest-800 transition-colors">Methodology</Link>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-forest-800 transition-colors"
            >
              <span>Open-Meteo API</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-charcoal-400 text-[11px]">
            © 2026 GlideTherm • Environmental Hackathon Prototype
          </div>
        </div>
      </footer>
    </div>
  );
};
