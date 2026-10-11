import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { StorageService } from '../src/services/storageService.js';
import { WeatherService } from '../src/services/weatherService.js';
import { getDeterministicDemoForecast } from '../src/data/operationalConfig.js';

describe('GlideTherm Express API Endpoints', () => {
  beforeEach(() => {
    // Reset test storage to clean isolated state
    StorageService.resetTestStorage();

    // Pre-populate deterministic test fixture weather in memory cache
    const testWeather2026 = getDeterministicDemoForecast('2026-10-11');
    WeatherService.setTestForecast('chennai', '2026-10-11', testWeather2026);

    const todayStr = new Date().toISOString().split('T')[0];
    WeatherService.setTestForecast('chennai', todayStr, getDeterministicDemoForecast(todayStr));
  });

  it('GET /api/health returns 200 and operational status with storage engine info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('GlideTherm API');
    expect(res.body.storageEngine).toBeDefined();
  });

  it('GET /api/config returns supported locations and worker profiles', async () => {
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.body.supportedLocations.length).toBeGreaterThanOrEqual(5);
    expect(res.body.workerProfiles.length).toBeGreaterThanOrEqual(5);
    expect(res.body.defaultLocationId).toBe('chennai');
  });

  it('GET /api/weather returns normalized forecast data with attribution', async () => {
    const res = await request(app).get('/api/weather?location=chennai&date=2026-10-11');
    expect(res.status).toBe(200);
    expect(res.body.location.id).toBe('chennai');
    expect(res.body.hourly.length).toBe(24);
    expect(res.body.attribution).toBeDefined();
    expect(res.body.retrievedAt).toBeDefined();
  });

  it('GET /api/dashboard returns structured dashboard model with thermal risk metrics', async () => {
    const res = await request(app).get('/api/dashboard?location=chennai&date=2026-10-11');
    expect(res.status).toBe(200);
    expect(res.body.currentConditions).toBeDefined();
    expect(res.body.bestWindows.length).toBeGreaterThan(0);
    expect(res.body.primaryAction).toBeDefined();
  });

  it('POST /api/shift-plans generates a valid shift plan', async () => {
    const payload = {
      locationId: 'chennai',
      date: '2026-10-11',
      profileId: 'outdoor_maintenance',
      startTime: '08:00',
      endTime: '16:00',
      workIntensity: 'heavy',
      shadeAvailability: 'limited',
      workSetting: 'mostly_outdoors',
      breakPreferenceMinutes: 15,
      indoorTasksAvailable: true,
      shiftReschedulingAllowed: true,
    };

    const res = await request(app)
      .post('/api/shift-plans')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.schedule.length).toBeGreaterThan(0);
    expect(res.body.summary.overallRisk).toBeDefined();
  });

  it('manages saved plans CRUD cycle', async () => {
    // 1. Initial list should be empty in clean test isolation
    const initialList = await request(app).get('/api/shift-plans');
    expect(initialList.status).toBe(200);
    expect(Array.isArray(initialList.body)).toBe(true);
    expect(initialList.body.length).toBe(0);

    // 2. Create a new plan
    const createRes = await request(app)
      .post('/api/shift-plans')
      .send({
        locationId: 'chennai',
        date: '2026-10-11',
        profileId: 'outdoor_maintenance',
        startTime: '08:00',
        endTime: '16:00',
        workIntensity: 'heavy',
        shadeAvailability: 'limited',
        workSetting: 'mostly_outdoors',
        breakPreferenceMinutes: 15,
        indoorTasksAvailable: true,
        shiftReschedulingAllowed: true,
      });
    expect(createRes.status).toBe(201);
    const createdId = createRes.body.id;

    // 3. List should now have 1 plan
    const listRes = await request(app).get('/api/shift-plans');
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);

    // 4. Fetch specific plan
    const fetchRes = await request(app).get(`/api/shift-plans/${createdId}`);
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.id).toBe(createdId);

    // 5. Delete the plan
    const delRes = await request(app).delete(`/api/shift-plans/${createdId}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // 6. Verify count returns to 0
    const afterDelRes = await request(app).get('/api/shift-plans');
    expect(afterDelRes.body.length).toBe(0);
  });
});
