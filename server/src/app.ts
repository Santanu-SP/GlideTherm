import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/apiRoutes.js';

export const app: Express = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Global 404 handler for API routes
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handler (prevents raw stack traces from leaking to client)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected operational error occurred.',
  });
});
