import { app } from './app.js';
import { StorageService } from './services/storageService.js';

const PORT = process.env.PORT || 5001;

// Ensure demo seed data is prepared
try {
  StorageService.getSavedPlans();
} catch (err) {
  console.warn('Initial storage check failed; will initialize lazily.', err);
}

const server = app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`   GlideTherm API Server running`);
  console.log(`   Local URL: http://localhost:${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/api/health`);
  console.log(`========================================\n`);
});

// Clean shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing HTTP server...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing HTTP server...');
  server.close(() => process.exit(0));
});
