import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HeatRiskBadge } from './HeatRiskBadge.js';

describe('HeatRiskBadge Component', () => {
  it('renders favourable label for lower_relative_concern', () => {
    render(<HeatRiskBadge category="lower_relative_concern" score={32} />);
    expect(screen.getByText('Lower Relative Concern')).toBeDefined();
    expect(screen.getByText('(32)')).toBeDefined();
  });

  it('renders alert label for high_caution', () => {
    render(<HeatRiskBadge category="high_caution" score={78} />);
    expect(screen.getByText('High Caution')).toBeDefined();
    expect(screen.getByText('(78)')).toBeDefined();
  });

  it('renders short label in small size mode', () => {
    render(<HeatRiskBadge category="severe_heat_advisory" size="sm" />);
    expect(screen.getByText('Advisory')).toBeDefined();
  });
});
