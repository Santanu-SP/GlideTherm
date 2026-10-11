import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { App } from './App.js';

describe('App Component Smoke Test', () => {
  it('renders landing page with headline and primary CTA', () => {
    render(<App />);
    expect(screen.getByText(/Plan the shift/i)).toBeDefined();
    expect(screen.getAllByText(/Plan Today's Shift/i).length).toBeGreaterThan(0);
  });
});
