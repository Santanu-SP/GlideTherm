# GlideTherm — AWS Serverless Architecture

## Overview

GlideTherm is designed as a cloud-native, serverless environmental intelligence platform. The architecture optimizes for minimal operational overhead, pay-per-request pricing, and instant regional scalability.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Browser / Mobile                     │
│                                                                 │
│  React 18 SPA (TypeScript, Vite, Recharts, Tailwind CSS)        │
└─────────────────────────┬───────────────────────────────────────┘
                          │  HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               AWS Amplify Hosting                               │
│                                                                 │
│  • Globally distributed CDN delivery via Amazon CloudFront      │
│  • Automated SSL/TLS termination                                │
│  • SPA fallback routing for client-side navigation             │
│  • Environment configuration: VITE_API_BASE_URL                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │  REST API Calls (HTTPS / JSON)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               Amazon API Gateway HTTP API                       │
│  (Region: ap-south-1, Stage: $default)                         │
│                                                                 │
│  • Route: ANY /{proxy+}  →  Lambda Proxy Integration            │
│  • CORS origin restriction matching frontend domain             │
│  • Payload format version 2.0 (low-latency HTTP API)            │
└─────────────────────────┬───────────────────────────────────────┘
                          │  AWS_PROXY
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               AWS Lambda: glidetherm-api                        │
│  Runtime: Node.js 22.x  |  Architecture: arm64 (Graviton2)      │
│  Memory: 512 MB         |  Timeout: 29s                         │
│                                                                 │
│  Adapter: @vendia/serverless-express wrapping Express app       │
│                                                                 │
│  Subsystems:                                                    │
│   ├── WeatherService       → Open-Meteo API with 15m in-memory  │
│   │                          caching and 503 unavailable errors │
│   ├── HeatAssessmentService→ Deterministic Heat Strain Index    │
│   │                          (0–100 scale, transparent logic)   │
│   ├── ShiftPlannerService  → Deterministic schedule generator   │
│   │                          with constraint satisfaction       │
│   └── DynamoStorageService → Amazon DynamoDB document client    │
└─────────────────────────┬───────────────────────────────────────┘
                          │  AWS IAM Least Privilege
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               Amazon DynamoDB: glidetherm-shift-plans          │
│                                                                 │
│  • Billing mode: PAY_PER_REQUEST (on-demand capacity)           │
│  • Partition Key: planId (String)                               │
│  • At-rest encryption via AWS KMS default keys                  │
│  • DeletionPolicy: Retain (protects against stack deletion)     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│               Amazon CloudWatch Logs                            │
│  Log Group: /aws/lambda/glidetherm-api                          │
│  Retention: 14 days (cost-effective audit retention)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## AWS Services Detail

### 1. Frontend Hosting: AWS Amplify Hosting
- **Purpose**: Serves the compiled production React/Vite application over HTTPS with edge CDN caching.
- **Routing**: SPA rewrite rules forward all navigation routes (`/planner`, `/outlook`, `/plans`, `/about`) to `index.html`.
- **Environment**: Injects `VITE_API_BASE_URL` pointing to the deployed API Gateway endpoint.

### 2. API Layer: Amazon API Gateway HTTP API
- **Purpose**: Low-latency, cost-effective API entry point routing all requests to the backend Lambda function.
- **CORS Configuration**: Restricts methods to `GET`, `POST`, `DELETE`, `OPTIONS` and validates origin headers.
- **Stage**: `$default` stage with automatic deployment.

### 3. Compute Layer: AWS Lambda (`glidetherm-api`)
- **Runtime**: `nodejs22.x` on 64-bit ARM (`arm64`), delivering high performance at lower execution costs.
- **Packaging**: Built using `esbuild` directly via AWS SAM CLI.
- **Framework Bridge**: `@vendia/serverless-express` converts API Gateway HTTP API v2.0 payloads into standard Express requests and responses, maintaining full parity between local development and cloud execution.

### 4. Database: Amazon DynamoDB (`glidetherm-shift-plans`)
- **Purpose**: Persistent storage for shift schedules generated and saved by users.
- **Schema**:
  - Partition Key (`HASH`): `planId` (string, UUID)
  - Attributes: `name` (string), `locationId` (string), `createdAt` (ISO8601), `updatedAt` (ISO8601), `planData` (JSON document).
- **Billing Mode**: `PAY_PER_REQUEST` ensures zero cost when idle.
- **Data Protection**: `DeletionPolicy: Retain` ensures production plans are preserved if the CloudFormation stack is updated or removed.

### 5. Monitoring & Observability: Amazon CloudWatch
- **Log Group**: `/aws/lambda/glidetherm-api`
- **Retention**: Set to 14 days via AWS SAM template to balance operational visibility with cost control.
- **Metrics**: Standard Lambda invocation count, duration, error rate, and throttles.

---

## Security Model & Cost Control

### Security Best Practices
- **Least Privilege IAM**: The Lambda execution role has permissions restricted strictly to `dynamodb:*` operations on the specific `glidetherm-shift-plans` table ARN.
- **No Hardcoded Credentials**: The application uses AWS IAM roles exclusively for AWS resource interaction. No secret keys or access tokens are bundled or committed.
- **Input Validation**: All shift planning requests and weather coordinates are validated server-side before processing.

### Estimated Operational Costs (Low Traffic Profile)
- **AWS Lambda**: $0.00 / month (covered by AWS Free Tier 1,000,000 monthly requests).
- **Amazon DynamoDB**: $0.00 / month (covered by 25 GB free storage + free 25 WCU/RCU).
- **Amazon API Gateway HTTP API**: ~$0.001 per 1,000 requests.
- **Amazon CloudWatch Logs**: $0.00 / month (covered by 5 GB free log ingestion).
- **AWS Amplify Hosting**: ~$0.00 - $0.01 / month for static file hosting.
