# GlideTherm

> **"Beat the heat. Plan smarter shifts."**  
> *Helping outdoor workforces make proactive, climate-informed decisions before peak thermal hazards arrive.*

---

## 1. Problem Statement
Outdoor workforces—including construction crews, municipal sanitation workers, delivery riders, and street vendors—frequently operate without practical guidance during extreme seasonal heat. 

Conventional weather applications display ambient temperatures and humidity percentages, but fail to translate those observations into actionable worksite decisions. Supervisors are left without answers to critical operational questions:
- *Which hours will expose crews to dangerous thermal strain?*
- *When should heavy manual exertion be relocated indoors or rescheduled?*
- *What specific hydration and shaded recovery intervals should be scheduled?*

**GlideTherm** bridges this gap by transforming hourly meteorological forecasts and worksite conditions into clear, deterministic, and occupation-aware daily shift plans.

---

## 2. Target Users & Demonstration Persona
- **Primary Demonstration Persona**: Municipal or roadway maintenance supervisor overseeing a field crew in **Chennai, India**.
- **Configurable Personas**:
  - Civil Construction Crews
  - Urban Delivery Riders
  - Sanitation & Waste Teams
  - Street Vendors & Market Staff
  - Agricultural Field Workers
- **Supported Cities**: Chennai, Bengaluru, New Delhi, Ahmedabad, and Hyderabad.

---

## 3. How GlideTherm Works
1. **Location & Worksite Configuration**: Select a target city and configure crew profile, shift hours, physical exertion intensity, worksite canopy shade, and whether indoor tasks are feasible.
2. **Forecast Integration**: Hourly forecast data is retrieved from Open-Meteo or supplied via a verified deterministic demonstration scenario.
3. **Deterministic Heat Strain Assessment**: The calculation engine calculates an explainable Heat Strain Index (HSI) reflecting thermal load, humidity, direct solar radiation, and metabolic pacing.
4. **Adaptive Schedule Generation**: GlideTherm produces a chronological work plan—allocating heavy work to cooler hours, shifting prep indoors during midday solar peaks, and scheduling shaded hydration intervals.
5. **Supervisor Decision Support**: Plain-language recommendations and an interactive crew safety checklist guide the team before and during the shift.

---

## 4. Key Differentiators
- **Hourly Heat-Risk Visualization**: Dual-axis meteorological charting of air temperature, apparent heat index, relative humidity, and solar radiation.
- **Occupation-Aware Planning**: Differentiates light, moderate, and heavy physical labor demands.
- **Indoor Task Shifting**: Relocates eligible tasks indoors during peak 12:00–14:30 solar peaks.
- **Explainable Recommendations**: Transparent rationale for every schedule recommendation.
- **Dual Live & Demo Modes**: Real-time Open-Meteo forecasts with a deterministic offline demonstration fallback.
- **Local-First Persistence**: Save, search, reopen, and delete shift plans stored in local JSON format.

---

## 5. Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, React Router v6.
- **Backend**: Node.js (v24), Express, TypeScript, CORS.
- **Data Persistence**: Local JSON file repository (`data/saved-plans.json`).
- **Testing**: Vitest, React Testing Library, Supertest.
- **Weather API**: Open-Meteo Free API (non-commercial, keyless tier).

---

## 6. Architecture Overview

```
GlideTherm/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (AppShell, HeatRiskBadge, Timeline, etc.)
│   │   ├── pages/              # Landing, Dashboard, Planner, Outlook, Safety, Plans, About
│   │   ├── services/           # ApiService client layer with fallback resilience
│   │   ├── types/              # Frontend TypeScript interfaces
│   │   ├── App.tsx             # Route definitions
│   │   └── main.tsx            # Application entrypoint
│   └── package.json
├── server/                     # Express + TypeScript Backend
│   ├── src/
│   │   ├── routes/             # Express API router (apiRoutes.ts)
│   │   ├── services/           # weatherService, heatAssessmentService, shiftPlannerService, storageService
│   │   ├── data/               # Supported locations and demo scenario baseline
│   │   ├── types/              # Domain data contracts
│   │   ├── app.ts              # Express application configuration
│   │   └── index.ts            # Server entrypoint (Port 5001)
│   └── tests/                  # Automated Vitest unit & integration tests
├── data/
│   └── saved-plans.json        # Local JSON persistence store
└── package.json                # Root workspace configuration
```

---

## 7. Local Setup & Quick Start

### Prerequisites
- Node.js >= 18.x (tested on v24.21.0)
- npm >= 9.x

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd GlideTherm

# Install workspace dependencies
npm install
```

### Starting the Application
You can run both client and server concurrently, or launch them individually:

```bash
# Run both Backend (Port 5001) and Frontend (Port 3000) concurrently
npm run dev

# Or launch independently:
npm run dev:server    # Backend API at http://localhost:5001
npm run dev:client    # Vite Frontend at http://localhost:3000
```

- **Frontend Application URL**: `http://localhost:3000`
- **Backend API URL**: `http://localhost:5001`
- **Backend Health Check**: `http://localhost:5001/api/health`

### Building for Production
```bash
npm run build
```

---

## 8. Running Automated Tests
GlideTherm includes comprehensive unit and integration test suites:

```bash
# Run all server tests (HeatAssessment, ShiftPlanner, and API endpoints)
npm run test:server

# Run all client tests (Components and Routing Smoke Tests)
npm run test:client

# Run all tests across the workspace
npm run test
```

---

## 9. API Route Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and uptime verification |
| `GET` | `/api/config` | Application metadata, supported cities, and crew profiles |
| `GET` | `/api/weather` | Normalized hourly forecast (`?location=chennai&demo=false`) |
| `GET` | `/api/dashboard` | Aggregated dashboard summary and primary recommendation |
| `POST` | `/api/heat-assessment` | Calculates HSI and risk categories for supplied weather points |
| `POST` | `/api/shift-plans` | Generates a climate-adaptive shift plan from settings |
| `GET` | `/api/shift-plans` | Lists all saved shift plans |
| `POST` | `/api/shift-plans/save` | Persists a shift plan into local storage |
| `GET` | `/api/shift-plans/:id` | Retrieves a specific plan by ID |
| `DELETE` | `/api/shift-plans/:id` | Deletes a plan from local storage |
| `GET` | `/api/demo/scenario` | Returns the baseline Chennai demonstration scenario |
| `POST` | `/api/demo/reset` | Restores default demonstration plans and reset states |

---

## 10. Meteorological Data Attribution & Fallback Behavior
- **Primary Data Source**: [Open-Meteo](https://open-meteo.com/), an open-source weather API providing hourly meteorological numerical weather prediction.
- **Attribution Statement**: *"Weather data by Open-Meteo (https://open-meteo.com/)"*.
- **Offline / Sandbox Resilience**: If the external weather service is unreachable or when running offline, GlideTherm automatically falls back to a deterministic, hot-season Chennai meteorological scenario (`isSimulatedData: true`) without application interruption or error screens.

---

## 11. Explanation of the Heat Strain Heuristic
The GlideTherm **Heat Strain Index (HSI)** is an explainable calculation scoring thermal burden on a 0–100 scale:
- **Baseline Thermal Load**: Derived from apparent temperature or air temperature.
- **Evaporative Sweat Mitigation**: Adjusted for high relative humidity (>60%), which impedes natural cooling.
- **Radiant Solar Irradiance**: Incorporates shortwave solar radiation (W/m²) modulated by worksite canopy shade (good, partial, or limited).
- **Metabolic Physical Exertion**: Accounts for internal heat generated by heavy manual labor versus moderate or light duties.
- **Categorization**:
  - `0–37`: **Lower Relative Concern** (favourable outdoor work window)
  - `38–61`: **Elevated Caution** (increased hydration and regular shade breaks)
  - `62–81`: **High Caution** (reassess heavy outdoor exertion; transition indoors)
  - `82–100`: **Severe Heat Advisory** (halt non-essential heavy manual labor)

---

## 12. 3-Minute Demonstration Walkthrough
1. **Landing Page**: Open `http://localhost:3000/`. Review the hero headline *"Plan the shift. Not the heat."* and interactive application preview.
2. **Dashboard Overview**: Click **"Explore the demo"** to view `/app`. Observe current conditions in Chennai (36.5°C, feels like 44.5°C), the high-caution advisory badge, and the best outdoor work windows (06:00–10:00).
3. **Shift Planner**: Navigate to `/app/planner`. Observe the default *Chennai Outdoor Maintenance Crew* profile (09:00–17:00).
4. **Input Modulation**: Modify **Physical Work Intensity** from *Moderate* to *Heavy*, and verify **Indoor Tasks Feasible** is checked.
5. **Generate Adaptive Schedule**: Click **"Generate Shift Plan"**. Observe how the schedule dynamically inserts an *Indoor Task Shift (11:30–14:00)* during peak solar irradiance and schedules mandatory shaded hydration breaks.
6. **Supervisor Rationale**: Review the explainable recommendation explaining why heavy midday excavation was relocated.
7. **Save & View Repository**: Name the plan and click **"Save Plan"**. Open `/app/plans` to verify the plan is stored.
8. **Crew Safety Protocol**: Open `/app/safety` and toggle items in the Pre-Shift and Active Shift checklists.

---

## 13. Future AWS Integration Plan
*(Documentation reference only. No AWS resources or credentials are provisioned in this prototype.)*

When transitioning from the local prototype to a production cloud deployment:
- **Frontend Hosting**: AWS Amplify Hosting or Amazon S3 with Amazon CloudFront for static asset distribution.
- **Backend API**: AWS Lambda running the Express handler via `@codegenie/serverless-express`, fronted by Amazon API Gateway.
- **Data Persistence**: Amazon DynamoDB for scalable, multi-tenant shift plan storage replacing local JSON files.
- **Forecasting Ingestion**: Amazon EventBridge scheduled rules triggering hourly Open-Meteo cache refreshes.
- **Monitoring & Observability**: Amazon CloudWatch for execution metrics, latency logging, and heat advisory threshold alarms.

---

## 14. Responsible-Use & Legal Disclaimer
**GlideTherm is a decision-support prototype.** It is NOT a medical device, certified emergency service, or occupational-safety certifying system. Calculations represent internal heuristic estimations and are not black-globe Wet-Bulb Globe Temperature (WBGT) measurements. Official warnings issued by governmental meteorological agencies (such as the India Meteorological Department) and established workplace safety regulations must always take precedence.

---

## 15. AI Disclosure Reminder
This project was designed, architected, and built with AI pair-programming assistance (Google Antigravity) for the Environmental Hackathon Heat and Water track.
