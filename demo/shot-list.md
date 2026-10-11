# GlideTherm — Shot List

## Shot-by-Shot Visual Guide for the Three-Minute Demo Recording

---

### SHOT 1 — 0:00–0:05 | Dashboard landing
**What to show:** GlideTherm Dashboard fully loaded in browser
- Full-page view at 100% zoom
- Location: Chennai, Tamil Nadu
- Data source badge visible at top (green "Live" or amber "Demo Fallback")
- Current heat risk badge visible

**Camera/crop:** Full browser window, no dev tools open

---

### SHOT 2 — 0:05–0:15 | Current conditions card
**What to show:** Current conditions panel
- Temperature (°C), apparent temperature, humidity, wind speed
- Heat risk category badge (colour coded)
- Primary action recommendation text

**Camera/crop:** Zoom into left/centre card area

---

### SHOT 3 — 0:15–0:25 | Data source label
**What to show:** Data source attribution label
- If live: "Live Open-Meteo Meteorological Forecast"
- If fallback: "Demonstration Fallback (Offline / Sandbox Mode)"
- Narrate explicitly which it is

---

### SHOT 4 — 0:25–0:35 | Outlook page
**What to show:** Click **Outlook** sidebar link → page loads
- Hourly heat timeline bar chart
- Colour gradient from green (morning) → orange/red (midday) → yellow (late afternoon)
- Best Work Windows cards below the chart

**Camera/crop:** Full page with sidebar visible

---

### SHOT 5 — 0:35–0:50 | Planner page — configuration
**What to show:** Click **Shift Planner** → configure settings
- Location: Chennai
- Profile: Outdoor Maintenance Crew
- Start: 09:00, End: 17:00
- Work Intensity: **Heavy** (selected)
- Shade: **Limited** (selected)
- Indoor tasks: **ON**

**Camera/crop:** Configuration panel — all settings visible

---

### SHOT 6 — 0:50–1:05 | Schedule generation
**What to show:** Click **Generate Schedule** button → schedule blocks animate in
- Show at least 4 schedule blocks
- Point cursor to the indoor task block (midday)
- Scroll down to show full schedule

**Camera/crop:** Schedule blocks area, full width

---

### SHOT 7 — 1:05–1:20 | Block detail — indoor task
**What to show:** Midday indoor block detail
- Block title: "Indoor Task Shift: Material Staging & Equipment Prep"
- Time range: ~11:00–14:00 (depends on forecast)
- Risk badge: Lower Relative Concern (green)
- Guidance text visible

---

### SHOT 8 — 1:20–1:35 | Recommendations panel
**What to show:** Recommendations section below schedule
- "Shift Demanding Outdoor Tasks Away From Midday" (orange/caution)
- "Erect Portable Shade Canopies" (yellow)
- "Implement Buddy System" (blue/info)
- "Review Hydration Logistics" (blue/info)

---

### SHOT 9 — 1:35–1:45 | Save plan
**What to show:** Click **Save Plan** button → success message/toast appears
- Button changes state (saved indicator)
- Toast notification: "Plan saved successfully" (or similar)

---

### SHOT 10 — 1:45–1:55 | Saved Plans page
**What to show:** Click **Saved Plans** sidebar → newly saved plan at top of list
- Plan card shows: plan name, location, date, overall risk badge
- Click on plan card → full schedule reloads from server

---

### SHOT 11 — 1:55–2:10 | Lambda in AWS Console
**What to show:** Lambda → Functions → glidetherm-api
- Function overview: name, runtime (Node.js 22.x), architecture (arm64), region
- Click **Monitor** → View CloudWatch Logs
- Recent log streams with timestamps

---

### SHOT 12 — 2:10–2:20 | CloudWatch invocation logs
**What to show:** Open a recent log stream
- Scroll to find a `POST` request to `/api/shift-plans` or `/api/shift-plans/save`
- Visible: request path, status code 200/201, duration
- Shows actual Lambda execution happened

---

### SHOT 13 — 2:20–2:30 | DynamoDB saved record
**What to show:** DynamoDB → Tables → glidetherm-shift-plans → Explore items
- Table item visible: planId, name, locationId, createdAt, updatedAt, planData
- This confirms the save operation actually wrote to AWS

---

### SHOT 14 — 2:30–2:40 | Closing frame
**What to show:** Return to GlideTherm app — Dashboard page
- Tagline visible: "Beat the heat. Plan smarter shifts."
- Narrate closing summary

**End recording.**

---

## Technical recording notes
- Use OBS Studio, QuickTime, or Loom for screen capture
- 1080p preferred; 720p minimum
- Microphone: use a headset or dedicated mic — avoid laptop mic
- Trim silence at start and end
- No background music needed
- YouTube: upload as Unlisted, verify playback in incognito before submission
