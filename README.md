# GlideTherm 🌡️

> **Beat the heat. Plan smarter shifts.**
> Climate-adaptive shift planning for India's outdoor workforce.

---

## The Problem

India's 400+ million outdoor workers — construction crews, sanitation workers, agricultural labourers, delivery riders, and maintenance teams — face escalating heat risk as climate change pushes summer temperatures above 44 °C in major cities.

Raw temperature numbers are not enough. Supervisors need guidance on *when* to work, *when* to rest, *when* to move indoors — accounting for humidity, solar radiation, work intensity, and crew profile.

**GlideTherm solves this.**

---

## What It Does

1. **Fetches live hourly weather** for Chennai, Bengaluru, New Delhi, Ahmedabad, and Hyderabad from Open-Meteo (free, no API key)
2. **Computes a transparent Heat Strain Index (0–100)** for each hour — factoring apparent temperature, humidity, solar radiation, shade availability, work intensity, and wind speed
3. **Generates a deterministic, time-blocked shift schedule** that:
   - Schedules heavy labour during cooler morning windows
   - Relocates crews indoors during peak heat (if indoor tasks are available)
   - Inserts mandatory hydration and rest breaks
   - Provides specific guidance per block
4. **Persists saved plans in Amazon DynamoDB** for retrieval across sessions

---

## Live Application

| Environment | URL |
|-------------|-----|
| **Production** (AWS Amplify) | `https://main.[xxx].amplifyapp.com` *(fill after deployment)* |
| **API Gateway** | `https://[api-id].execute-api.ap-south-1.amazonaws.com` *(fill after deployment)* |
| Local dev (frontend) | http://localhost:3000 |
| Local dev (backend) | http://localhost:5001 |

---

## Features

- ✅ Live Open-Meteo weather forecast for 5 Indian cities
- ✅ Hourly Heat Strain Index with explainable contributing factors
- ✅ 4-level risk categorisation (Lower Concern → Severe Heat Advisory)
- ✅ Best work window identification
- ✅ 6 outdoor worker profiles (maintenance, construction, delivery, sanitation, street vendor, agricultural)
- ✅ Heat-adaptive shift schedule generation
- ✅ Indoor task scheduling during peak heat windows
- ✅ Structured hydration break scheduling
- ✅ Contextual operational recommendations
- ✅ Deterministic demo fallback when live weather is unavailable
- ✅ Clear data-source labelling (live vs simulated — never misrepresented)
- ✅ Save, list, retrieve, and delete shift plans (DynamoDB in production)
- ✅ Demo scenario reset
- ✅ Responsive design (desktop and mobile)

---

## AWS Architecture

```
Browser (React SPA)
      │
      ▼ HTTPS
AWS Amplify Hosting  ──── CloudFront CDN
      │
      ▼ fetch()
Amazon API Gateway HTTP API  (ap-south-1)
      │
      ▼ Lambda Proxy
AWS Lambda: glidetherm-api  (Node.js 22.x, arm64)
    │                      │
    ▼                      ▼
Open-Meteo API        Amazon DynamoDB
(live weather)        (saved shift plans)
                           │
                     CloudWatch Logs
```

See [`demo/aws-architecture.md`](demo/aws-architecture.md) for full details, IAM permissions, and cost estimates.

### AWS Services Used

| Service | Role |
|---------|------|
| AWS Amplify Hosting | Frontend CDN + HTTPS |
| Amazon API Gateway HTTP API | Route requests to Lambda |
| AWS Lambda | Execute all backend logic |
| Amazon DynamoDB | Persist saved shift plans (PAY_PER_REQUEST) |
| Amazon CloudWatch Logs | Lambda execution evidence (14-day retention) |
| AWS IAM | Least-privilege Lambda execution role |

---

## Local Development

### Prerequisites
- Node.js 20+
- npm 10+

### Setup

```bash
git clone https://github.com/Santanu-SP/GlideTherm.git
cd GlideTherm
npm install          # installs root + server + client workspaces
npm run dev          # starts backend (:5001) and frontend (:3000) concurrently
```

Open [http://localhost:3000](http://localhost:3000)

The Vite dev server proxies `/api` requests to `localhost:5001` automatically.

### Environment variables

For local development, no `.env` file is required. The proxy handles API routing.

For production builds, set `VITE_API_BASE_URL` (see [`.env.example`](.env.example)):
```bash
VITE_API_BASE_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com
```

---

## Running Tests

```bash
npm test                    # all tests (server + client)
npm run test:server         # server unit + integration tests
npm run test:client         # client component tests
```

Expected: **20/20 tests pass** (10 server business logic, 6 server API integration, 4 client components)

---

## AWS Deployment

### Prerequisites
- AWS CLI v2 authenticated: `aws login`
- SAM CLI: `brew install aws-sam-cli`
- Region: `ap-south-1` (Mumbai)

### Step 1 — Build and deploy backend
```bash
# Validate template
sam validate --template template.yaml --region ap-south-1

# Build Lambda bundle (esbuild)
sam build --beta-features

# Deploy (first time: guided)
sam deploy --guided \
  --stack-name glidetherm-demo \
  --region ap-south-1 \
  --parameter-overrides AllowedOrigin="*"

# Get the API Gateway URL from outputs
aws cloudformation describe-stacks \
  --stack-name glidetherm-demo \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs'
```

### Step 2 — Build frontend with API URL
```bash
cd client
VITE_API_BASE_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com \
  npm run build
# Output: client/dist/
```

### Step 3 — Deploy frontend to Amplify

**Manual deployment (fastest):**
```bash
cd client/dist
zip -r ../glidetherm-frontend.zip .
```
Then: AWS Console → Amplify → New App → Deploy without Git → upload the ZIP.

Configure Amplify rewrite rules for SPA routing:
- Source: `</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp|mjs)$)([^.]+$)/>`
- Target: `/index.html`
- Type: 200 (Rewrite)

After Amplify deployment, update the `AllowedOrigin` parameter:
```bash
sam deploy --stack-name glidetherm-demo --region ap-south-1 \
  --parameter-overrides AllowedOrigin="https://main.xxx.amplifyapp.com" \
  --no-confirm-changeset
```

### Step 4 — Seed demo data
```bash
curl -X POST https://<api-id>.execute-api.ap-south-1.amazonaws.com/api/demo/reset
```

### Cleanup (when done)
```bash
sam delete --stack-name glidetherm-demo --region ap-south-1
# Note: DynamoDB table has DeletionPolicy=Retain — delete manually if desired
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check |
| GET | `/api/config` | Supported locations and worker profiles |
| GET | `/api/weather?location=&date=&demo=` | Hourly weather forecast |
| GET | `/api/dashboard?location=&profile=&demo=` | Dashboard summary |
| POST | `/api/heat-assessment` | Compute heat assessment for given weather points |
| POST | `/api/shift-plans?demo=` | Generate a shift plan |
| GET | `/api/shift-plans` | List all saved plans |
| POST | `/api/shift-plans/save` | Save a plan to DynamoDB |
| GET | `/api/shift-plans/:id` | Retrieve plan by ID |
| DELETE | `/api/shift-plans/:id` | Delete a plan |
| GET | `/api/demo/scenario` | Canonical Chennai demo scenario |
| POST | `/api/demo/reset` | Reset to canonical demo state |

---

## Data Sources

- **Weather:** [Open-Meteo](https://open-meteo.com/) — free meteorological forecast API, CC BY 4.0, no API key required
- **Demo scenario:** Deterministic synthetic baseline modelled on realistic Chennai hot-season coastal conditions

---

## Assessment Heuristic — Limitations

The Heat Strain Index (HSI) is a **transparency-oriented educational heuristic**, not a certified medical or occupational health instrument.

It does **not**:
- Replace certified WBGT (Wet Bulb Globe Temperature) measurement
- Account for individual worker acclimatisation, health status, or hydration level
- Constitute a medical recommendation or safety guarantee
- Meet regulatory occupational health standards

**Do not use GlideTherm as the sole basis for worker safety decisions without professional occupational health review.**

---

## Demo

See the [`demo/`](demo/) directory for:
- [`recording-script.md`](demo/recording-script.md) — Three-minute narrated script
- [`shot-list.md`](demo/shot-list.md) — Shot-by-shot visual guide
- [`recording-checklist.md`](demo/recording-checklist.md) — Pre-recording checklist
- [`aws-architecture.md`](demo/aws-architecture.md) — Architecture diagram and cost breakdown
- [`submission-writeup.md`](demo/submission-writeup.md) — Hackathon submission
- [`ai-disclosure.md`](demo/ai-disclosure.md) — Honest AI tool disclosure
- [`verification-results.md`](demo/verification-results.md) — Build, test, and API verification results

---

## Responsible Use

- This tool assists planning decisions; it does not replace safety supervision
- Always comply with local occupational health regulations
- Involve qualified occupational health professionals before operational deployment
- Worker health monitoring and buddy systems remain the supervisor's responsibility
- The system's environmental claims are limited to demonstrating the scheduling concept; no impact measurements exist

---

## AI Disclosure

Built with significant assistance from Claude Sonnet 4.6 (via Antigravity IDE by Google DeepMind). See [`demo/ai-disclosure.md`](demo/ai-disclosure.md) for full details.

---

## License

This project is provided as a hackathon prototype. All third-party libraries retain their original licenses. See [`demo/ai-disclosure.md`](demo/ai-disclosure.md) for the full attribution table.
