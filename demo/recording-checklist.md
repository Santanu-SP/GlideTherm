# GlideTherm — Recording Checklist

## Before you start recording

### Browser setup
- [ ] Open incognito/private window
- [ ] Set window to 1280×720 minimum (1920×1080 preferred for screen recording)
- [ ] Disable browser notifications
- [ ] Set zoom to 100%
- [ ] Clear any existing GlideTherm tabs

### URLs to have open
- [ ] **Tab 1 — App:** `https://main.XXXX.amplifyapp.com` (replace with actual URL)
- [ ] **Tab 2 — Lambda Logs:** AWS Console → Lambda → glidetherm-api → Monitor → CloudWatch Logs
- [ ] **Tab 3 — DynamoDB:** AWS Console → DynamoDB → Tables → glidetherm-shift-plans → Explore items
- [ ] **Tab 4 (optional) — Amplify:** AWS Console → Amplify → GlideTherm

### Demo reset
```bash
# Run this before recording to ensure clean demo state
curl -X POST https://<API_GATEWAY_URL>/api/demo/reset
```
- [ ] Confirm: Saved Plans page shows "Chennai Outdoor Maintenance Crew (Demo Baseline)"
- [ ] Confirm: Dashboard loads without errors
- [ ] Confirm: Data source label is visible (Live or Fallback — note which)

### Settings for demo scenario
The planner must be configured to these exact values during recording:
- Location: **Chennai, Tamil Nadu**
- Profile: **Outdoor Maintenance Crew**
- Start time: **09:00**
- End time: **17:00**
- Work intensity: **Heavy**
- Shade: **Limited**
- Indoor tasks: **Available** ✓

---

## During recording

### Section 1 (0:00–0:15) — The Problem
- [ ] Narrate heat illness problem
- [ ] Show Dashboard with current weather data

### Section 2 (0:15–0:35) — Introduce GlideTherm
- [ ] Point out data source label (is it live or fallback?)
- [ ] Narrate: *"If the label says 'Demonstration Fallback', that means the live weather provider was unreachable in this environment — the app uses a verified deterministic scenario"*
- [ ] Show current conditions and primary recommendation

### Section 3 (0:35–1:10) — Outlook + Planner
- [ ] Click Outlook → show bar chart
- [ ] Click Planner → configure settings (as above)
- [ ] Click **Generate Schedule** → blocks appear
- [ ] Scroll through blocks

### Section 4 (1:10–1:35) — Recommendations
- [ ] Scroll to Recommendations section
- [ ] Point to: peak heat window time
- [ ] Point to: indoor task block
- [ ] Point to: at least 2 recommendations (shade canopies, buddy system, hydration)

### Section 5 (1:35–1:55) — Save and Reopen
- [ ] Click **Save Plan**
- [ ] Wait for confirmation
- [ ] Click **Saved Plans** in sidebar
- [ ] Confirm new plan appears at top of list
- [ ] Click the plan card → full schedule loads

### Section 6 (1:55–2:25) — AWS Evidence
- [ ] Switch to Lambda tab → show function name and runtime
- [ ] Click CloudWatch Logs → show recent log stream → open a stream → find POST request log line
- [ ] Switch to DynamoDB tab → show Explore items → find the saved plan by planId
- [ ] (Optional) Switch to Amplify tab → show deployment

### Section 7 (2:25–2:40) — Close
- [ ] Narrate summary and limitations
- [ ] Stop recording

---

## After recording
- [ ] Trim to ≤ 3:00 minutes
- [ ] Upload to YouTube (Unlisted)
- [ ] Verify the link works in incognito
- [ ] Copy URL into submission form

---

## If something goes wrong during demo

| Problem | Recovery |
|---------|----------|
| "Network error" on dashboard | Refresh; app falls back to demo data automatically |
| Plan save fails | Check network tab; ensure API Gateway URL is in build |
| DynamoDB shows no items | Run demo reset: `curl -X POST https://<api>/api/demo/reset` |
| CloudWatch logs empty | Invoke health endpoint to trigger a log: `curl https://<api>/api/health` |
| Amplify URL 404 | Check custom rewrite rules are configured in Amplify console |
