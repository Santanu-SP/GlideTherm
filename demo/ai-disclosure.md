# GlideTherm — AI Tool Disclosure

## Honest Disclosure of AI Development Tools

This project was developed with assistance from AI coding tools. This disclosure is made in good faith and is as accurate as possible.

---

## AI Tools Used

### Primary: Antigravity IDE (Google DeepMind)
- **Model:** Claude Sonnet 4.6 (Thinking) via the Antigravity coding assistant
- **Role:** Principal pair-programming assistant throughout development
- **Scope of use:**
  - Architectural design and planning
  - TypeScript/React/Node.js code generation
  - AWS SAM template authoring
  - Service design (heat assessment heuristic, shift scheduling algorithm, storage adapters)
  - Test generation
  - Documentation (README, demo scripts, architecture diagrams)
  - Debugging and quality audit
  - Refactoring and code review

### No other AI tools were used in this project.

---

## What the AI did NOT do

- The heat assessment heuristic parameters (thermal base scale, humidity thresholds, solar radiation penalties, metabolic intensity adjustments, wind speed modifiers) were designed based on occupational heat stress literature concepts, not generated arbitrarily. The AI helped implement and test the algorithm, not invent the problem domain.
- The demo scenario data (Chennai baseline temperatures, humidity, solar radiation curve) is modelled on realistic coastal south Indian hot-season conditions.
- No AI model is called at runtime — there is no LLM API call in production code.
- No Bedrock, no GPT API, no Gemini API is used by the deployed application.
- No AI-generated images are served to users.

---

## What remains the developer's responsibility

- The choice of application domain and target users
- The decision to use deterministic, explainable algorithms (not black-box ML)
- The safety caveats and responsible-use disclaimers
- The final selection of AWS services and architecture
- The hackathon submission and compliance with competition rules

---

## Third-Party Libraries and Attributions

| Library / Service | License | Role |
|---|---|---|
| React | MIT | Frontend framework |
| Vite | MIT | Build tool |
| TypeScript | Apache-2.0 | Type-safe development |
| Tailwind CSS | MIT | Styling |
| Recharts | MIT | Data visualisation charts |
| Lucide React | ISC | UI icons |
| React Router DOM | MIT | Client-side routing |
| clsx + tailwind-merge | MIT | Conditional class utilities |
| Express | MIT | Backend HTTP server |
| cors | MIT | CORS middleware |
| @vendia/serverless-express | Apache-2.0 | Lambda/Express bridge |
| @aws-sdk/client-dynamodb | Apache-2.0 | DynamoDB AWS SDK |
| @aws-sdk/lib-dynamodb | Apache-2.0 | DynamoDB document client |
| vitest | MIT | Test framework |
| supertest | MIT | HTTP integration testing |
| tsx | MIT | TypeScript dev server |
| Open-Meteo API | CC BY 4.0 / open | Free meteorological forecast |
| AWS SAM CLI | Apache-2.0 | Serverless deployment tooling |

---

## Disclaimer

The use of AI coding assistance does not imply that the AI generated the project independently. The developer directed, reviewed, tested, and is responsible for all code in this repository.

The heat assessment heuristic is NOT a certified medical or occupational health instrument. It is a transparency-oriented educational approximation intended to demonstrate the concept of climate-adaptive scheduling. It should not be used for actual worker safety decisions without professional occupational health calibration.
