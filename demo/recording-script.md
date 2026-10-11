# GlideTherm — Three-Minute Recording Script
## Target duration: 2 min 40 sec (with 20-second safety margin)

---

## Pre-recording checklist
- [ ] Open browser in a private/incognito window (no cached data)
- [ ] Resize to 1280×720 or 1920×1080 — no zoomed-in view
- [ ] Open the GlideTherm public URL and keep it at the Dashboard tab
- [ ] Have AWS Console open in another tab: Lambda → glidetherm-api → Monitor → Logs
- [ ] Have AWS Console open in a third tab: DynamoDB → Tables → glidetherm-shift-plans → Explore items
- [ ] Run demo reset via: `curl -X POST https://<API_GATEWAY_URL>/api/demo/reset`
- [ ] Confirm the demo plan "Chennai Outdoor Maintenance Crew (Demo Baseline)" appears in Saved Plans

---

## Script

### 0:00 – 0:15 — The Problem
> "Every year, thousands of outdoor workers in India suffer heat-related illness during gruelling summer shifts.
> The problem isn't just the temperature — it's the lack of actionable, real-time guidance about *when* to work, rest, and seek shade.
> GlideTherm solves this."

**[Show]** An empty screen or simple text slide if not live yet; or pan across the Dashboard

---

### 0:15 – 0:35 — Introduce GlideTherm
> "GlideTherm is a climate-adaptive shift planning tool built for outdoor workforce supervisors.
> It fetches live weather data, runs a transparent heat-strain assessment, and generates a heat-safe daily schedule — in seconds."

**[Show]** Dashboard page open at Chennai, Tamil Nadu
- Point to: current conditions card, heat risk badge, data source label ("Live Open-Meteo" or "Demonstration Fallback")
- Point to: primary action recommendation

---

### 0:35 – 1:10 — Heat Outlook and Planner Demo
> "The Hourly Heat Outlook shows exactly how thermal risk changes across the day — helping supervisors pre-plan, not react."

**[Show]** Click **Outlook** in sidebar
- Point to: the bar chart or timeline — morning favourable, midday severe
- Point to: Best Work Windows cards

> "Now let's build a shift plan for an outdoor maintenance crew."

**[Show]** Click **Shift Planner** in sidebar
- Set location: Chennai
- Set profile: Outdoor Maintenance Crew
- Shift: 09:00 – 17:00
- Work intensity: Heavy
- Shade: Limited
- Indoor tasks: Available (toggle ON)
- Click **Generate Schedule**
- Watch the schedule blocks appear

---

### 1:10 – 1:35 — Explain the Recommendation
> "The engine identified that peak apparent temperature reaches 44.9°C at 1 PM.
> It automatically schedules heavy work in the early morning, moves the crew indoors during the peak window, and resumes outdoor tasks after 3 PM."

**[Show]** Scroll through schedule blocks:
- "Primary Outdoor Work Window (Favourable)" → 09:15 – 10:35
- "Indoor Task Shift" → during midday
- "Late Afternoon Outdoor Resumption" → 14:xx – 17:00

- Point to: risk badges (colour-coded: green / yellow / orange / red)
- Point to: Recommendations section (portable shade canopies, buddy system, hydration)

---

### 1:35 – 1:55 — Persistence Demo
> "Plans can be saved and retrieved across sessions — stored persistently in Amazon DynamoDB on AWS."

**[Show]** Click **Save Plan** button
- A success toast/confirmation appears

**[Show]** Navigate to **Saved Plans** page in sidebar
- The newly saved plan appears in the list
- Click on the plan card — the full schedule re-loads from the backend

---

### 1:55 – 2:25 — Real AWS Usage
> "Let me show you the actual AWS infrastructure powering this."

**[Show — AWS Console Tab 1 — Lambda]**
- Navigate to: Lambda → Functions → glidetherm-api
- Show: Function Overview, runtime (Node.js 22.x), architecture (arm64)
- Click: Monitor → View CloudWatch Logs
- Show: Recent log stream with actual invocation logs
  - Look for: `POST /api/shift-plans` or `POST /api/shift-plans/save`

**[Show — AWS Console Tab 2 — DynamoDB]**
- Navigate to: DynamoDB → Tables → glidetherm-shift-plans → Explore items
- Show: The saved plan item with planId, name, createdAt attributes

**[Show — AWS Console Tab 3 — Amplify (optional)]**
- Navigate to: AWS Amplify → GlideTherm → Last deployment
- Show: Deployed URL, last build timestamp

> "The React frontend is hosted on AWS Amplify. All API calls go through Amazon API Gateway to this Lambda function. Data is stored in DynamoDB."

---

### 2:25 – 2:40 — Close
> "GlideTherm demonstrates how publicly available weather data and deterministic heat modelling can protect outdoor workers from preventable heat illness.
>
> This is a prototype. The heat assessment uses an explainable heuristic, not certified medical thresholds. Real deployment would require occupational health calibration and worker feedback.
>
> Built during the hackathon — entirely with open data, serverless AWS, and zero proprietary AI."

**[End recording]**

---

## Timing notes
- Each section has ~5 seconds of slack built in
- Do not rush the AWS console section — judges want to see real resources
- If live weather is unavailable, the app shows "Demonstration Fallback" — narrate: *"The app gracefully falls back to a verified deterministic scenario"*
