import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { PlannerPage } from './pages/PlannerPage.js';
import { OutlookPage } from './pages/OutlookPage.js';
import { SafetyPage } from './pages/SafetyPage.js';
import { PlansPage } from './pages/PlansPage.js';
import { AboutPage } from './pages/AboutPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Operational App Workspace with AppShell */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="outlook" element={<OutlookPage />} />
          <Route path="safety" element={<SafetyPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        {/* Catch-all redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
