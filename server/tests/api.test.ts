import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('GlideTherm Express API Endpoints', () => {
  beforeEach(async () => {
    // Reset demo state before tests
    await request(app).post('/api/demo/reset');
  });

  it('GET /api/health returns 200 and operational status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('GlideTherm API');
  });

  it('GET /api/config returns supported locations and worker profiles', async () => {
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.body.supportedLocations.length).toBeGreaterThanOrEqual(5);
    expect(res.body.workerProfiles.length).toBeGreaterThanOrEqual(5);
    expect(res.body.defaultLocationId).toBe('chennai');
  });

  it('GET /api/weather returns normalized forecast data (demo or live)', async () => {
    const res = await request(app).get('/api/weather?location=chennai&demo=true');
    expect(res.status).toBe(200);
    expect(res.body.location.id).toBe('chennai');
    expect(res.body.hourly.length).toBe(24);
    expect(res.body.isSimulatedData).toBe(true);
  });

  it('GET /api/dashboard returns structured dashboard model', async () => {
    const res = await request(app).get('/api/dashboard?location=chennai&demo=true');
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
      .post('/api/shift-plans?demo=true')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.schedule.length).toBeGreaterThan(0);
    expect(res.body.summary.overallRisk).toBeDefined();
  });

  it('manages saved plans CRUD cycle', async () => {
    // 1. List saved plans
    const listRes = await request(app).get('/api/shift-plans');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    const initialCount = listRes.body.length;

    // 2. Fetch specific plan
    const firstPlan = listRes.body[0];
    const fetchRes = await request(app).get(`/api/shift-plans/${firstPlan.id}`);
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.id).toBe(firstPlan.id);

    // 3. Delete a plan
    const delRes = await request(app).delete(`/api/shift-plans/${firstPlan.id}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // 4. Verify count reduced
    const afterDelRes = await request(app).get('/api/shift-plans');
    expect(afterDelRes.body.length).toBe(initialCount - 1);
  });
});
