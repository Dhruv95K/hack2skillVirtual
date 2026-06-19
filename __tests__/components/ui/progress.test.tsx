/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { Progress as ProgressPrimitive } from '@base-ui/react/progress';

describe('Progress Components', () => {
  it('renders the Progress bar', () => {
    render(<Progress value={50} data-testid="progress-root" />);
    expect(screen.getByTestId('progress-root')).toBeInTheDocument();
  });

  it('renders the ProgressLabel', () => {
    render(
      <Progress value={50}>
        <ProgressLabel>Loading...</ProgressLabel>
      </Progress>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the ProgressValue', () => {
    render(
      <Progress value={50}>
        <ProgressValue>50%</ProgressValue>
      </Progress>
    );
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders Track and Indicator explicitly', () => {
    render(
      <ProgressPrimitive.Root value={50}>
        <ProgressTrack data-testid="track">
          <ProgressIndicator data-testid="indicator" />
        </ProgressTrack>
      </ProgressPrimitive.Root>
    );
    expect(screen.getByTestId('track')).toBeInTheDocument();
    expect(screen.getByTestId('indicator')).toBeInTheDocument();
  });
});
