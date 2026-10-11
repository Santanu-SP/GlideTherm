# GlideTherm — API Reference

Base URL (Local): `http://localhost:5001`  
Base URL (Production): Deployed Amazon API Gateway HTTP API URL (`https://<api-id>.execute-api.ap-south-1.amazonaws.com`)

All request and response payloads use JSON format (`Content-Type: application/json`).

---

## 1. System & Configuration

### `GET /api/health`
Checks application health and reports the active persistence engine.

**Response `200 OK`**:
```json
{
  "status": "ok",
  "service": "GlideTherm API",
  "version": "1.0.0",
  "storageEngine": "Amazon DynamoDB", // or "Local JSON Store"
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

---

### `GET /api/config`
Returns metadata regarding supported geographic regions, predefined worker profiles, and environmental track information.

**Response `200 OK`**:
```json
{
  "supportedLocations": [
    {
      "id": "chennai",
      "name": "Chennai",
      "state": "Tamil Nadu",
      "country": "India",
      "latitude": 13.0827,
      "longitude": 80.2707,
      "timezone": "Asia/Kolkata"
    }
  ],
  "workerProfiles": [
    {
      "id": "outdoor_maintenance",
      "title": "Outdoor Maintenance Crew",
      "description": "Municipal, roadway, and grounds facility maintenance crews.",
      "defaultStartTime": "09:00",
      "defaultEndTime": "17:00",
      "defaultIntensity": "heavy",
      "defaultShade": "limited",
      "defaultSetting": "mostly_outdoors",
      "indoorTasksFeasible": true,
      "flexibility": "moderate"
    }
  ],
  "defaultLocationId": "chennai",
  "defaultProfileId": "outdoor_maintenance",
  "environmentalTrack": "Heat and Water",
  "openMeteoAttribution": "Weather data by Open-Meteo (https://open-meteo.com/)"
}
```

---

## 2. Weather & Operations

### `GET /api/weather`
Fetches 24-hour meteorological forecasts from Open-Meteo with 15-minute in-memory caching.

**Query Parameters**:
- `location` (string, optional, default: `"chennai"`): Identifier of supported location.
- `date` (string, optional, default: today's date `YYYY-MM-DD`).

**Response `200 OK`**:
```json
{
  "location": { "id": "chennai", "name": "Chennai", ... },
  "date": "2026-10-11",
  "hourly": [
    {
      "time": "2026-10-11T09:00",
      "hour": 9,
      "temperature": 34.6,
      "apparentTemperature": 39.8,
      "relativeHumidity": 65,
      "windSpeed": 13.8,
      "solarRadiation": 670,
      "isDaytime": true
    }
  ],
  "isSimulatedData": false,
  "dataSourceLabel": "Open-Meteo Numerical Weather Prediction",
  "attribution": "Weather data by Open-Meteo (https://open-meteo.com/)",
  "retrievedAt": "2026-10-11T12:00:00.000Z"
}
```

**Response `503 Service Unavailable`** (when provider is unreachable and no cache exists):
```json
{
  "error": "WEATHER_UNAVAILABLE",
  "message": "Weather forecast temporarily unavailable from Open-Meteo for Chennai."
}
```

---

### `GET /api/dashboard`
Aggregates real-time weather metrics, thermal assessment, optimal work windows, and actionable guidelines for the operational dashboard.

**Query Parameters**:
- `location` (string, optional, default: `"chennai"`): Location identifier.
- `profile` (string, optional, default: `"outdoor_maintenance"`): Worker profile identifier.
- `date` (string, optional, default: today's date).

**Response `200 OK`**:
```json
{
  "location": { ... },
  "date": "2026-10-11",
  "profile": { ... },
  "currentConditions": {
    "weather": { ... },
    "assessment": {
      "heatStrainIndex": 78,
      "category": "high_caution",
      "level": "high",
      "primaryReasons": ["High apparent temperature: 42.1°C", "Intense solar radiation: 820 W/m²"],
      "recommendedActions": ["Implement 15-minute rest breaks per hour", "Provide shaded recovery areas"]
    }
  },
  "bestWindows": [
    {
      "startTime": "06:00",
      "endTime": "10:00",
      "durationHours": 4,
      "averageHeatStrain": 38,
      "peakCategory": "moderate_caution"
    }
  ],
  "primaryAction": "Shift high-intensity tasks to 06:00–10:00 window.",
  "hourlyTimeline": [ ... ],
  "retrievedAt": "2026-10-11T12:00:00.000Z"
}
```

---

## 3. Shift Planning & Persistent Storage

### `POST /api/shift-plans`
Generates a deterministic climate-adaptive schedule based on work parameters and forecasted meteorological risk.

**Request Body**:
```json
{
  "locationId": "chennai",
  "date": "2026-10-11",
  "profileId": "outdoor_maintenance",
  "startTime": "08:00",
  "endTime": "16:00",
  "workIntensity": "heavy",
  "shadeAvailability": "limited",
  "workSetting": "mostly_outdoors",
  "breakPreferenceMinutes": 15,
  "indoorTasksAvailable": true,
  "shiftReschedulingAllowed": true
}
```

**Response `201 Created`**:
```json
{
  "id": "c1f7a0e2-6284-4731-9f93-b1dca50ff519",
  "name": "Outdoor Maintenance Crew Shift Plan — 2026-10-11",
  "location": { ... },
  "date": "2026-10-11",
  "request": { ... },
  "schedule": [
    {
      "startTime": "08:00",
      "endTime": "11:00",
      "type": "regular_work",
      "activity": "Outdoor Physical Work",
      "riskCategory": "moderate_caution",
      "guideline": "Maintain regular hydration cadence."
    },
    {
      "startTime": "11:00",
      "endTime": "14:00",
      "type": "indoor_task_alternative",
      "activity": "Indoor / Sheltered Maintenance Work",
      "riskCategory": "high_caution",
      "guideline": "Shift from open sunlight to sheltered workshop."
    }
  ],
  "summary": {
    "totalShiftHours": 8,
    "outdoorWorkHours": 5,
    "indoorWorkHours": 3,
    "breakHours": 0.5,
    "peakHeatWindow": "11:00 - 14:00",
    "overallRisk": "high_caution"
  },
  "createdAt": "2026-10-11T12:05:00.000Z"
}
```

---

### `GET /api/shift-plans`
Retrieves all saved shift plans from persistent storage (DynamoDB in cloud deployment; JSON storage in local mode).

**Response `200 OK`**: Array of `ShiftPlan` objects.

---

### `POST /api/shift-plans/save`
Persists or updates an existing shift plan in storage.

**Request Body**: `ShiftPlan` object.  
**Response `200 OK`**: Saved `ShiftPlan` object with updated timestamp.

---

### `GET /api/shift-plans/:id`
Retrieves a specific plan by unique ID.

**Response `200 OK`**: `ShiftPlan` object.  
**Response `404 Not Found`**: `{ "error": "Plan not found" }`.

---

### `DELETE /api/shift-plans/:id`
Deletes a saved shift plan from persistent storage.

**Response `200 OK`**:
```json
{
  "success": true,
  "message": "Shift plan deleted successfully"
}
```
**Response `404 Not Found`**: `{ "error": "Plan not found" }`.
