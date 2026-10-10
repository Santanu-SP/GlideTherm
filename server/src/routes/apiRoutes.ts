import { Router, Request, Response } from 'express';
import { SUPPORTED_LOCATIONS, WORKER_PROFILES, getDeterministicDemoForecast } from '../data/demoScenario.js';
import { WeatherService } from '../services/weatherService.js';
import { HeatAssessmentService } from '../services/heatAssessmentService.js';
import { ShiftPlannerService } from '../services/shiftPlannerService.js';
import { StorageService } from '../services/storageService.js';
import { ShiftPlanRequest } from '../types/index.js';

export const apiRouter = Router();

// GET /api/health
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'GlideTherm API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/config
apiRouter.get('/config', (_req: Request, res: Response) => {
  res.status(200).json({
    supportedLocations: SUPPORTED_LOCATIONS,
    workerProfiles: WORKER_PROFILES,
    defaultLocationId: 'chennai',
    defaultProfileId: 'outdoor_maintenance',
    environmentalTrack: 'Heat and Water',
    openMeteoAttribution: 'Weather data by Open-Meteo (https://open-meteo.com/)',
  });
});

// GET /api/weather
apiRouter.get('/weather', async (req: Request, res: Response) => {
  try {
    const locationId = (req.query.location as string) || 'chennai';
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const forceDemo = req.query.demo === 'true';

    const weather = await WeatherService.getForecast(locationId, dateStr, forceDemo);
    res.status(200).json(weather);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown weather service error';
    res.status(500).json({ error: 'Failed to retrieve forecast', details: message });
  }
});

// GET /api/dashboard
apiRouter.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const locationId = (req.query.location as string) || 'chennai';
    const profileId = (req.query.profile as string) || 'outdoor_maintenance';
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const forceDemo = req.query.demo === 'true';

    const weather = await WeatherService.getForecast(locationId, dateStr, forceDemo);
    const profile = WORKER_PROFILES.find(p => p.id === profileId) || WORKER_PROFILES[0];

    // Assess timeline using profile defaults
    const assessments = HeatAssessmentService.assessTimeline(weather.hourly, {
      workIntensity: profile.defaultIntensity,
      shadeAvailability: profile.defaultShade,
      workSetting: profile.defaultSetting,
    });

    const bestWindows = HeatAssessmentService.findBestWorkWindows(assessments);

    // Current hour index (or mid-morning default)
    const currentHour = new Date().getHours();
    const currentPoint = weather.hourly.find(h => h.hour === currentHour) || weather.hourly[10];
    const currentAssessment = assessments.find(a => a.hour === currentPoint.hour) || assessments[10];

    // Find peak heat period
    const sortedByAppTemp = [...assessments].sort((a, b) => b.apparentTemperature - a.apparentTemperature);
    const peakHourAssessment = sortedByAppTemp[0];

    res.status(200).json({
      location: weather.location,
      date: weather.date,
      isSimulatedData: weather.isSimulatedData,
      dataSourceLabel: weather.dataSourceLabel,
      attribution: weather.attribution,
      retrievedAt: weather.retrievedAt,
      profile,
      currentConditions: {
        time: currentPoint.time,
        temperature: currentPoint.temperature,
        apparentTemperature: currentPoint.apparentTemperature,
        relativeHumidity: currentPoint.relativeHumidity,
        windSpeed: currentPoint.windSpeed,
        solarRadiation: currentPoint.solarRadiation,
        assessment: currentAssessment,
      },
      peakHeatConditions: {
        hour: peakHourAssessment.hour,
        temperature: peakHourAssessment.temperature,
        apparentTemperature: peakHourAssessment.apparentTemperature,
        category: peakHourAssessment.category,
        categoryLabel: peakHourAssessment.categoryLabel,
      },
      bestWindows,
      timeline: assessments,
      primaryAction: {
        title: peakHourAssessment.category === 'severe_heat_advisory' || peakHourAssessment.category === 'high_caution'
          ? 'Reassess Heavy Midday Labor'
          : 'Maintain Standard Heat Precautions',
        recommendation: peakHourAssessment.recommendedAction,
        rationale: peakHourAssessment.primaryReasons[0] || 'Based on forecast thermal load and worksite intensity.',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown dashboard error';
    res.status(500).json({ error: 'Failed to construct dashboard', details: message });
  }
});

// POST /api/heat-assessment
apiRouter.post('/heat-assessment', (req: Request, res: Response) => {
  try {
    const { weatherPoints, workIntensity, shadeAvailability, workSetting } = req.body;
    if (!Array.isArray(weatherPoints) || weatherPoints.length === 0) {
      return res.status(400).json({ error: 'weatherPoints array is required' });
    }

    const assessments = HeatAssessmentService.assessTimeline(weatherPoints, {
      workIntensity,
      shadeAvailability,
      workSetting,
    });
    const bestWindows = HeatAssessmentService.findBestWorkWindows(assessments);

    res.status(200).json({ assessments, bestWindows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to calculate heat assessment';
    res.status(500).json({ error: 'Assessment calculation failed', details: message });
  }
});

// POST /api/shift-plans
apiRouter.post('/shift-plans', async (req: Request, res: Response) => {
  try {
    const requestData = req.body as ShiftPlanRequest & { saveImmediately?: boolean };

    if (!requestData.locationId || !requestData.startTime || !requestData.endTime) {
      return res.status(400).json({ error: 'Missing required shift planning fields.' });
    }

    const forceDemo = req.query.demo === 'true';
    const weather = await WeatherService.getForecast(requestData.locationId, requestData.date, forceDemo);

    const plan = ShiftPlannerService.generatePlan(
      requestData,
      weather.hourly,
      weather.isSimulatedData,
      weather.dataSourceLabel
    );

    if (requestData.saveImmediately) {
      StorageService.savePlan(plan);
    }

    res.status(201).json(plan);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Plan generation failed';
    res.status(400).json({ error: 'Failed to generate shift plan', details: message });
  }
});

// GET /api/shift-plans
apiRouter.get('/shift-plans', (_req: Request, res: Response) => {
  try {
    const plans = StorageService.getSavedPlans();
    res.status(200).json(plans);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve saved plans';
    res.status(500).json({ error: 'Storage error', details: message });
  }
});

// POST /api/shift-plans/save
apiRouter.post('/shift-plans/save', (req: Request, res: Response) => {
  try {
    const plan = req.body;
    if (!plan || !plan.id || !plan.schedule) {
      return res.status(400).json({ error: 'Invalid shift plan format' });
    }
    const saved = StorageService.savePlan(plan);
    res.status(200).json(saved);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save shift plan';
    res.status(500).json({ error: 'Storage save failed', details: message });
  }
});

// GET /api/shift-plans/:id
apiRouter.get('/shift-plans/:id', (req: Request, res: Response) => {
  try {
    const plan = StorageService.getSavedPlanById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: `Plan with id '${req.params.id}' not found.` });
    }
    res.status(200).json(plan);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Storage read error';
    res.status(500).json({ error: 'Failed to fetch plan', details: message });
  }
});

// DELETE /api/shift-plans/:id
apiRouter.delete('/shift-plans/:id', (req: Request, res: Response) => {
  try {
    const deleted = StorageService.deletePlan(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: `Plan with id '${req.params.id}' not found.` });
    }
    res.status(200).json({ success: true, message: `Plan '${req.params.id}' deleted.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Storage delete error';
    res.status(500).json({ error: 'Failed to delete plan', details: message });
  }
});

// GET /api/demo/scenario
apiRouter.get('/demo/scenario', (_req: Request, res: Response) => {
  const dateStr = '2026-10-11';
  const demoPoints = getDeterministicDemoForecast(dateStr);
  const location = SUPPORTED_LOCATIONS[0];
  const profile = WORKER_PROFILES[0];

  res.status(200).json({
    scenarioName: 'Chennai Outdoor Maintenance Crew',
    location,
    profile,
    shift: {
      startTime: '09:00',
      endTime: '17:00',
      workIntensity: 'heavy',
      shadeAvailability: 'limited',
      workSetting: 'mostly_outdoors',
      indoorTasksAvailable: true,
      breakPreferenceMinutes: 15,
    },
    forecast: demoPoints,
    isSimulatedData: true,
    dataSourceLabel: 'Deterministic Demonstration Scenario (Chennai Heat Baseline)',
  });
});

// POST /api/demo/reset
apiRouter.post('/demo/reset', (_req: Request, res: Response) => {
  try {
    const plans = StorageService.resetDemo();
    res.status(200).json({
      success: true,
      message: 'Demonstration state reset successfully.',
      savedPlans: plans,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Reset failed';
    res.status(500).json({ error: 'Failed to reset demo', details: message });
  }
});
