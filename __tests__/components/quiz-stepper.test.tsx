/** @jest-environment jsdom */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizStepper, QUIZ_QUESTIONS } from '@/components/quiz/quiz-stepper';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

global.fetch = jest.fn();

describe('QuizStepper', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders step 1 questions on mount', () => {
    render(<QuizStepper />);
    expect(screen.getByText(/What is your primary mode of daily transport\?/i)).toBeInTheDocument();
    expect(screen.getByText(/How many km do you travel per week\?/i)).toBeInTheDocument();
  });

  it('Next button disabled until all questions in step are answered', async () => {
    render(<QuizStepper />);
    const nextButton = screen.getByRole('button', { name: /Next/i });
    
    expect(nextButton).toBeDisabled();

    // Fill transport answers
    await userEvent.selectOptions(screen.getByLabelText(/primary mode of daily transport/i), 'car_petrol');
    await userEvent.type(screen.getByLabelText(/How many km do you travel per week/i), '100');
    await userEvent.type(screen.getByLabelText(/How many flights do you take per year/i), '2');

    expect(nextButton).not.toBeDisabled();
  });

  it('advances to step 2 on Next click', async () => {
    render(<QuizStepper />);
    
    // Fill step 1
    await userEvent.selectOptions(screen.getByLabelText(/primary mode of daily transport/i), 'car_petrol');
    await userEvent.type(screen.getByLabelText(/How many km do you travel per week/i), '100');
    await userEvent.type(screen.getByLabelText(/How many flights do you take per year/i), '2');
    
    // Click Next
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Should see step 2
    expect(screen.getByText(/How would you describe your diet\?/i)).toBeInTheDocument();
  });

  it('shows progress bar updating correctly', async () => {
    render(<QuizStepper />);
    
    // Check initial progress
    const progressText = screen.getByText(/Step 1 of 3/i);
    expect(progressText).toBeInTheDocument();

    // Fill step 1 and next
    await userEvent.selectOptions(screen.getByLabelText(/primary mode of daily transport/i), 'car_petrol');
    await userEvent.type(screen.getByLabelText(/How many km do you travel per week/i), '100');
    await userEvent.type(screen.getByLabelText(/How many flights do you take per year/i), '2');
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Check progress
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
  });

  it('submit button calls POST /api/quiz and redirects', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<QuizStepper />);
    
    // Step 1
    await userEvent.selectOptions(screen.getByLabelText(/primary mode of daily transport/i), 'car_petrol');
    await userEvent.type(screen.getByLabelText(/How many km do you travel per week/i), '100');
    await userEvent.type(screen.getByLabelText(/How many flights do you take per year/i), '2');
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 2
    await userEvent.selectOptions(screen.getByLabelText(/How would you describe your diet/i), 'vegan');
    await userEvent.type(screen.getByLabelText(/How many meat meals do you eat per week/i), '0');
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Step 3
    await userEvent.selectOptions(screen.getByLabelText(/What is your home size/i), '2bedroom');
    await userEvent.type(screen.getByLabelText(/Estimated monthly electricity use/i), '200');
    
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    expect(submitButton).not.toBeDisabled();
    
    await userEvent.click(submitButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/quiz', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String),
    }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
