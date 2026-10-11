# GlideTherm — AWS Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     User / Browser                              │
│                                                                 │
│  React SPA (TypeScript, Vite, Recharts, Tailwind CSS)           │
└─────────────────────────┬───────────────────────────────────────┘
                          │  HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               AWS Amplify Hosting                               │
│                                                                 │
│  • Hosts the compiled React/Vite frontend (static files)        │
│  • Global CDN delivery via CloudFront                           │
│  • Automatic HTTPS / TLS                                        │
│  • SPA routing via custom rewrite rules                         │
│  • Build variable: VITE_API_BASE_URL = API Gateway URL          │
└─────────────────────────┬───────────────────────────────────────┘
                          │  API calls (fetch)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               Amazon API Gateway HTTP API                       │
│  (ap-south-1, $default stage)                                   │
│                                                                 │
│  Route: ANY /{proxy+}  →  Lambda                                │
│  CORS configured for Amplify origin                             │
│  Payload format: v2.0 (HTTP API)                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │  Lambda Proxy Integration
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               AWS Lambda: glidetherm-api                        │
│  Runtime: Node.js 22.x  |  Arch: arm64  |  Memory: 512 MB      │
│  Timeout: 29 seconds                                            │
│                                                                 │
│  Entry: lambda.ts (@vendia/serverless-express wraps Express)    │
│                                                                 │
│  Services loaded inside Lambda:                                 │
│   ├─ WeatherService      → fetches Open-Meteo live API          │
│   │                         (deterministic fallback if offline) │
│   ├─ HeatAssessmentService → transparent Heat Strain Index      │
│   │                           heuristic (0–100 scale)           │
│   ├─ ShiftPlannerService → deterministic schedule builder       │
│   └─ DynamoStorageService → reads/writes DynamoDB               │
│                                                                 │
│  Routes:                                                        │
│   GET  /api/health              Health check                    │
│   GET  /api/config              Locations & worker profiles     │
│   GET  /api/weather             Hourly forecast (live/demo)     │
│   GET  /api/dashboard           Dashboard summary               │
│   POST /api/heat-assessment     Single-shot assessment          │
│   POST /api/shift-plans         Generate shift plan             │
│   GET  /api/shift-plans         List saved plans                │
│   POST /api/shift-plans/save    Save a plan to DynamoDB         │
│   GET  /api/shift-plans/:id     Retrieve plan by ID             │
│   DELETE /api/shift-plans/:id   Delete plan                     │
│   GET  /api/demo/scenario       Deterministic demo data         │
│   POST /api/demo/reset          Reset demo state                │
└──────────┬────────────────────────────────┬───────────────────┘
           │                                │
           ▼                                ▼
┌─────────────────────┐      ┌──────────────────────────────────┐
│  Open-Meteo API     │      │  Amazon DynamoDB                 │
│  (free, no key)     │      │  Table: glidetherm-shift-plans   │
│                     │      │                                  │
│  live weather data  │      │  PK: planId (String)             │
│  for 5 Indian cities│      │  Attrs: name, createdAt,         │
│  hourly forecast    │      │         updatedAt, planData      │
│                     │      │  Billing: PAY_PER_REQUEST        │
└─────────────────────┘      │  (on-demand, no idle cost)       │
                             └──────────────────────────────────┘

                             CloudWatch Logs (auto-created)
                             Retention: 14 days
                             Group: /aws/lambda/glidetherm-api
```

## AWS Services Used

| Service | Role | Pricing Model |
|---------|------|---------------|
| AWS Amplify Hosting | Frontend CDN + HTTPS | ~$0.15/GB served; build minutes |
| Amazon API Gateway HTTP API | Route requests to Lambda | $1.00/million requests |
| AWS Lambda | Execute all backend logic | 1M req/month free tier; then $0.20/M |
| Amazon DynamoDB | Persist saved shift plans | 25 GB storage + 25 RCU/WCU free tier |
| Amazon CloudWatch Logs | Lambda invocation logs | 5 GB ingest free tier |
| AWS IAM | Least-privilege Lambda role | No cost |

## Cost Estimate (Short Demo)

For a typical hackathon demo with ~1,000 API calls:
- Lambda: ~$0.00 (well within 1M/month free tier)
- DynamoDB: ~$0.00 (well within free tier)
- API Gateway: ~$0.001
- Amplify: ~$0.00 (build + small static site)
- CloudWatch: ~$0.00 (within free tier)

**Expected total cost for demo: < $0.10**

> ⚠️ Estimates assume AWS Free Tier eligibility. Actual costs depend on account age, prior usage, and region pricing.

## IAM Permissions (Lambda Execution Role)

The Lambda function is granted only:
- `AWSLambdaBasicExecutionRole` (CloudWatch log writes)
- `dynamodb:PutItem` — save plans
- `dynamodb:GetItem` — retrieve plan by ID
- `dynamodb:DeleteItem` — delete plan
- `dynamodb:Scan` — list all plans
- `dynamodb:UpdateItem` — update plan

No `AdministratorAccess`. No `FullDynamoDBAccess`. Scoped to the specific table ARN only.

## Deployment Infrastructure

**Stack name:** `glidetherm-demo`
**Region:** `ap-south-1` (Mumbai)
**IaC tool:** AWS SAM (Serverless Application Model)
**Template:** `template.yaml` (root of this repository)

### Deploy commands (after `aws login`):

```bash
# 1. Build the TypeScript Lambda bundle
sam build --use-container --beta-features

# 2. Deploy (guided first time to set params and S3 bucket)
sam deploy --guided --stack-name glidetherm-demo --region ap-south-1 \
  --parameter-overrides AllowedOrigin="*"

# 3. Get outputs
aws cloudformation describe-stacks --stack-name glidetherm-demo \
  --region ap-south-1 --query 'Stacks[0].Outputs'

# 4. Build frontend with real API URL (replace URL from step 3)
cd client
VITE_API_BASE_URL=https://<api-id>.execute-api.ap-south-1.amazonaws.com npm run build

# 5. Deploy frontend to Amplify (see README for Amplify manual deploy)
```

## Non-AWS Services Used

- **Open-Meteo** (https://open-meteo.com/) — free, no API key, open-source meteorological forecast API
- No paid LLM, no Bedrock, no Marketplace subscriptions
