'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const QUIZ_QUESTIONS = [
  // Transport (category: 'transport')
  { key: 'primary_transport', category: 'transport', question: 'What is your primary mode of daily transport?', type: 'select', options: ['car_petrol','car_diesel','car_electric','bus','train','motorcycle','bicycle','walking'] },
  { key: 'weekly_km', category: 'transport', question: 'How many km do you travel per week?', type: 'number', unit: 'km' },
  { key: 'flights_per_year', category: 'transport', question: 'How many flights do you take per year?', type: 'number', unit: 'flights' },
  // Food (category: 'food')
  { key: 'diet_type', category: 'food', question: 'How would you describe your diet?', type: 'select', options: ['vegan','vegetarian','pescatarian','meat_moderate','meat_heavy'] },
  { key: 'meat_meals_per_week', category: 'food', question: 'How many meat meals do you eat per week?', type: 'number', unit: 'meals' },
  // Energy (category: 'energy')
  { key: 'home_size', category: 'energy', question: 'What is your home size?', type: 'select', options: ['studio','1bedroom','2bedroom','3bedroom','4plus'] },
  { key: 'monthly_electricity_kwh', category: 'energy', question: 'Estimated monthly electricity use (kWh)?', type: 'number', unit: 'kWh' },
];

const STEPS = [
  { title: 'Transport', category: 'transport' },
  { title: 'Food', category: 'food' },
  { title: 'Energy', category: 'energy' },
];

export function QuizStepper() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = STEPS[currentStep].category;
  const questionsInStep = QUIZ_QUESTIONS.filter(q => q.category === currentCategory);

  const isStepComplete = questionsInStep.every(q => {
    const val = answers[q.key];
    return val !== undefined && val !== '';
  });

  const handleChange = (key: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: answers }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/50 p-6 md:p-8 rounded-xl border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 text-sm font-medium text-slate-300">
          <span>{STEPS[currentStep].title}</span>
          <span>Step {currentStep + 1} of {STEPS.length}</span>
        </div>
        <Progress value={progressPercentage} className="h-2 bg-slate-800" />
      </div>

      <div className="space-y-6 min-h-[300px]">
        {questionsInStep.map((q) => (
          <div key={q.key} className="space-y-2">
            <label htmlFor={q.key} className="block text-sm font-medium text-slate-200">
              {q.question}
            </label>
            {q.type === 'select' ? (
              <select
                id={q.key}
                value={(answers[q.key] as string) || ''}
                onChange={(e) => handleChange(q.key, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              >
                <option value="" disabled>Select an option</option>
                {q.options?.map(opt => (
                  <option key={opt} value={opt}>
                    {opt.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <input
                  id={q.key}
                  type="number"
                  min="0"
                  value={(answers[q.key] as number) ?? ''}
                  onChange={(e) => handleChange(q.key, e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12"
                  placeholder="0"
                />
                {q.unit && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
                    {q.unit}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-800">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0 || isSubmitting}
          className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Previous
        </Button>
        
        {currentStep === STEPS.length - 1 ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!isStepComplete || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : 'Submit'}
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            disabled={!isStepComplete}
            className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
