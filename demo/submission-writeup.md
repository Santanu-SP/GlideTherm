# GlideTherm — Hackathon Submission Write-up

## Project Name
**GlideTherm**
*Beat the heat. Plan smarter shifts.*

## Tagline
Climate-adaptive shift planning for India's outdoor workforce.

## One-Sentence Description
GlideTherm helps supervisors protect outdoor workers from heat illness by turning live weather forecasts into actionable, time-blocked shift schedules — powered by serverless AWS.

---

## The Problem

India's 400+ million outdoor workers — construction crews, sanitation workers, agricultural labourers, delivery riders, maintenance teams — face escalating heat risk as climate change drives summer temperatures above 44°C in major cities.

Existing occupational safety tools either:
- Provide raw temperature numbers without scheduling guidance
- Require expensive proprietary systems
- Ignore the interaction of humidity, solar radiation, work intensity, and shade availability

The result: supervisors make ad-hoc decisions, workers are exposed to preventable heat illness during the most dangerous midday hours, and productivity collapses under unmanaged heat stress.

---

## The Solution

GlideTherm is a free, open web application that:

1. **Fetches real-time hourly weather** for 5 major Indian cities via Open-Meteo (free, no API key)
2. **Calculates an explainable Heat Strain Index (0–100)** for each hour, factoring in:
   - Apparent temperature (heat index)
   - Relative humidity and its effect on sweat cooling
   - Solar radiation intensity and worksite shade
   - Metabolic work intensity (light/moderate/heavy)
   - Wind speed (convective heating or cooling)
   - Work setting (exposed / mixed / mostly outdoor)
3. **Generates a time-blocked shift schedule** that:
   - Schedules heavy work in the comparatively cooler morning
   - Moves the crew indoors during peak heat if indoor tasks are available
   - Structures mandatory hydration breaks
   - Provides specific guidance for each block
4. **Saves plans persistently to AWS DynamoDB** so supervisors can review, compare, and share plans across sessions

---

## Environmental Sustainability Track

**Track: Heat and Water**

GlideTherm addresses the intersection of climate change (rising ambient temperatures) and workforce vulnerability. Outdoor workers are direct, first-line victims of urban heat island effects and changing precipitation patterns that affect thermal conditions.

By enabling smarter scheduling:
- Peak-hour heavy labour is reduced, directly lowering acute heat illness risk
- Supervisors gain evidence-based tools rather than relying on intuition
- The system creates a cultural norm of weather-responsive work planning

---

## Technical Architecture

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Recharts
**Backend:** Node.js + Express + TypeScript
**Cloud:** AWS Amplify (hosting) + API Gateway + Lambda + DynamoDB + CloudWatch

See [`demo/aws-architecture.md`](./aws-architecture.md) for the full architecture diagram.

---

## AWS Services

| Service | Role |
|---------|------|
| AWS Amplify | Hosts built React SPA over HTTPS with global CDN |
| Amazon API Gateway (HTTP API) | Routes all API requests to Lambda |
| AWS Lambda (Node.js 22.x, arm64) | Executes all business logic |
| Amazon DynamoDB | Persists saved shift plans (PAY_PER_REQUEST) |
| Amazon CloudWatch Logs | Records Lambda invocation evidence |
| AWS IAM | Least-privilege Lambda execution role |

---

## Key Design Decisions

### Transparent heuristic, not a black box
The Heat Strain Index is a deterministic, explainable formula. Every factor is labelled and shown to the user. We deliberately avoided a "magic AI score" that no one can verify.

### Serverless-first for cost and scale
A single Lambda function handles all routes using `@vendia/serverless-express`. At hackathon scale, costs are effectively zero. At production scale, Lambda auto-scales without provisioned infrastructure.

### No authentication required for demo
The application works without login, making it immediately accessible for a hackathon demonstration. Production deployment would add Cognito or a similar authentication layer.

### Deterministic demo fallback
When the live weather API is unavailable (e.g. in a sandboxed network), the application falls back to a verified, deterministic Chennai heat baseline scenario. The UI clearly labels which data source is active.

### Open-Meteo: free, no key, CC-licensed
Choosing Open-Meteo eliminated API key management, rate limits, and payment requirements — making the project fully reproducible by anyone.

---

## Limitations and Honest Caveats

- The Heat Strain Index is an **educational heuristic**, not a certified WBGT (Wet Bulb Globe Temperature) measurement or a medical instrument.
- It does **not** account for individual worker health, hydration status, acclimatisation history, or protective clothing.
- Recommendations are **operational suggestions**, not safety guarantees. Professional occupational health review is required before real-world deployment.
- The application has **not been validated** with actual workers or shown to reduce heat illness in production.
- Weather data accuracy depends on Open-Meteo's forecast quality for the specific location and date.

---

## Implemented Features

- [x] Live weather from Open-Meteo for 5 Indian cities
- [x] Hourly Heat Strain Index (0–100) with explainable factors
- [x] Risk categorisation (Lower Concern → Severe Heat Advisory)
- [x] Best work window identification
- [x] Deterministic shift schedule generation
- [x] 6 outdoor worker profiles (maintenance, construction, delivery, sanitation, vendor, agricultural)
- [x] Indoor task scheduling during peak heat
- [x] Hydration break scheduling
- [x] Contextual recommendations
- [x] Save plans to DynamoDB (AWS)
- [x] List, retrieve, delete saved plans
- [x] Demo reset to canonical scenario
- [x] Graceful fallback to deterministic demo when live weather unavailable
- [x] Data source label (always shows whether data is live or simulated)
- [x] Fully responsive design (desktop + mobile)

## Future Ideas (Not Implemented)

- [ ] Push notifications or daily SMS alerts for supervisors
- [ ] Multi-language support (Tamil, Hindi, Telugu)
- [ ] Worker mobile app for individual shift access
- [ ] Historical plan analytics and heat trend tracking
- [ ] Integration with government NDMA heat action plans
- [ ] Calibration against validated WBGT instruments

---

## How to Run Locally

```bash
git clone https://github.com/Santanu-SP/GlideTherm.git
cd GlideTherm
npm install
npm run dev      # starts both frontend (port 3000) and backend (port 5001)
```

Open http://localhost:3000

---

## Repository

https://github.com/Santanu-SP/GlideTherm

---

## AI Disclosure

Built with significant assistance from Claude Sonnet 4.6 (via Antigravity IDE by Google DeepMind). Full disclosure in [`demo/ai-disclosure.md`](./ai-disclosure.md).
