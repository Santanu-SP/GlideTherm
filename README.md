# GlideTherm — Climate-Adaptive Outdoor Workforce Planning

**GlideTherm** is a production-grade environmental intelligence and workforce planning platform that helps supervisors and operations teams anticipate environmental heat risk, assess physiological thermal strain, and schedule outdoor work safely.

---

## Key Capabilities

- **Real-Time Meteorological Intelligence**: Automatically queries 24-hour hourly meteorological forecasts from Open-Meteo (including dry-bulb temperature, apparent heat index, relative humidity, wind velocity, and solar radiation). Built-in 15-minute in-memory caching minimizes external network calls.
- **Empirical Heat Strain Index (HSI)**: Computes a transparent, 0–100 thermal risk indicator factoring in dry-bulb temperature, humidity penalties, solar radiation, metabolic work intensity, and shade availability.
- **Deterministic Shift Schedule Optimization**: Reallocates high-risk outdoor activities to cooler morning or evening windows, schedules mandatory hydration breaks, and substitutes sheltered/indoor tasks during peak heat waves.
- **Persistent Schedule Storage**: Stores shift plans reliably in Amazon DynamoDB in AWS deployments or local JSON storage during development, supporting full create, retrieve, list, and delete (CRUD) cycles.
- **Transparent Operational Attribution**: Clearly identifies data sources, timestamps, and model assumptions without fabricating sensor telemetry or claiming unverified medical certifications.

---

## Architecture Overview

GlideTherm is engineered as a serverless full-stack web application:

```
┌────────────────────────────────────────────────────────┐
│                   Web & Mobile Browser                 │
│         React 18, TypeScript, Vite, Tailwind CSS       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS
                            ▼
┌────────────────────────────────────────────────────────┐
│                   AWS Amplify Hosting                  │
│       Global CDN Delivery, SSL/TLS, SPA Rewrites       │
└───────────────────────────┬────────────────────────────┘
                            │ API Gateway HTTP API (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   AWS Lambda (ARM64)                   │
│   Node.js 22.x + @vendia/serverless-express Adapter    │
│   • Weather Service (Open-Meteo + 15m Cache)           │
│   • Heat Assessment Service (0-100 HSI Heuristic)      │
│   • Shift Planner Service (Deterministic Scheduler)    │
│   • DynamoStorage Service (DynamoDB DocumentClient)    │
└─────────────┬────────────────────────────┬─────────────┘
              │ CRUD Operations            │ CloudWatch Logs
              ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Amazon DynamoDB        │  │  Amazon CloudWatch Logs  │
│ glidetherm-shift-plans   │  │ 14-Day Retention         │
│ PAY_PER_REQUEST Billing  │  │ Structured Audit Logs    │
└──────────────────────────┘  └──────────────────────────┘
```

Detailed architectural diagrams and service configurations are available in [`docs/aws-architecture.md`](docs/aws-architecture.md).

---

## Repository Structure

```
GlideTherm/
├── client/                     # Frontend React + TypeScript application
│   ├── src/
│   │   ├── components/         # Reusable UI cards, tables, badges, modals
│   │   ├── pages/              # Dashboard, Planner, Outlook, Plans, About
│   │   ├── services/           # Typed API client
│   │   └── types/              # Domain TypeScript interfaces
│   └── index.html              # HTML entry point with metadata
├── server/                     # Backend Node.js + Express application
│   ├── src/
│   │   ├── data/               # Static locations and worker profile configurations
│   │   ├── routes/             # REST API routes
│   │   ├── services/           # Weather, heat assessment, planner, storage
│   │   ├── types/              # Backend TypeScript types
│   │   ├── app.ts              # Express application configuration
│   │   ├── index.ts            # Local standalone server entry point
│   │   └── lambda.ts           # AWS Lambda handler adapter
│   └── tests/                  # Vitest unit and integration test suites
├── data/                       # Local JSON storage directory (development)
├── docs/                       # Technical architecture and API documentation
│   ├── aws-architecture.md     # Serverless cloud design and cost analysis
│   ├── api-reference.md        # Complete REST API reference
│   └── disclosures.md          # Responsible usage and attributions
├── template.yaml               # AWS SAM Infrastructure as Code template
└── package.json                # Root orchestration workspace scripts
```

---

## Getting Started (Local Development)

### Prerequisites

- **Node.js**: v20 or v22 LTS
- **npm**: v10 or newer

### Installation

Clone the repository and install all workspace dependencies:

```bash
git clone https://github.com/Santanu-SP/GlideTherm.git
cd GlideTherm
npm install
```

### Running Locally

Start both the backend API server (`http://localhost:5001`) and the Vite frontend dev server (`http://localhost:3000`) concurrently:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

Environment variables can be customized in `.env` (copy from `.env.example`):

### Server Configuration
| Variable | Description | Default |
|---|---|---|
| `PORT` | Local Express listening port | `5001` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `DYNAMODB_TABLE_NAME` | When set, enables DynamoDB persistence instead of local JSON | *Unset (uses local file)* |
| `AWS_REGION` | AWS region for DynamoDB client | `ap-south-1` |

### Frontend Configuration
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for API calls | `http://localhost:5001` (dev) / `""` (prod) |

---

## Verification & Testing

Run the automated test suites:

```bash
# Run server unit and integration tests
npm run test:server

# Run client component tests
npm run test:client

# Run all tests across workspace
npm test

# Build production bundles for both client and server
npm run build
```

---

## AWS Deployment (Serverless Infrastructure)

GlideTherm is configured for one-command deployment using the **AWS Serverless Application Model (SAM)**.

### Prerequisites for AWS Deployment
1. **AWS CLI** configured with appropriate permissions.
2. **AWS SAM CLI** installed (`sam --version`).
3. Active AWS credentials in your environment.

### Deployment Steps

1. **Build the SAM application**:
   ```bash
   sam build
   ```

2. **Deploy the CloudFormation stack**:
   ```bash
   sam deploy --guided --stack-name glidetherm-production --region ap-south-1
   ```
   During the guided prompt:
   - Provide `AllowedOrigin` (your Amplify frontend URL or `*` initially).
   - Confirm SAM template authorization changes.

3. **Deploy the Frontend to AWS Amplify Hosting**:
   - Connect your Git repository to AWS Amplify Console.
   - Set build output directory to `client/dist`.
   - Set environment variable: `VITE_API_BASE_URL = <API_GATEWAY_URL>` (from SAM outputs).
   - Add a Single Page Application rewrite rule: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>` to `/index.html` with status code `200 (Rewrite)`.

---

## API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and storage engine info |
| `GET` | `/api/config` | Supported locations and worker profiles |
| `GET` | `/api/weather` | 24-hour meteorological forecast from Open-Meteo |
| `GET` | `/api/dashboard` | Dashboard thermal metrics and best work windows |
| `POST` | `/api/heat-assessment` | Single-hour thermal risk calculation |
| `POST` | `/api/shift-plans` | Generates a climate-adaptive shift schedule |
| `GET` | `/api/shift-plans` | Lists all saved shift plans |
| `POST` | `/api/shift-plans/save` | Persists a shift plan |
| `GET` | `/api/shift-plans/:id` | Retrieves a specific plan by ID |
| `DELETE` | `/api/shift-plans/:id` | Deletes a plan from persistent storage |

For full request/response schemas, see [`docs/api-reference.md`](docs/api-reference.md).

---

## Disclosures & Attributions

- **Responsible Use**: GlideTherm provides operational guidance based on weather data and mathematical heuristics. It is not an OSHA/NIOSH compliance certification or a substitute for professional occupational health assessment.
- **Meteorological Data**: Weather forecast data provided by Open-Meteo under CC BY 4.0.
- For full disclosures, see [`docs/disclosures.md`](docs/disclosures.md).
