'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QUIZ_QUESTIONS, QUIZ_STEPS } from '@/lib/quiz';
export { QUIZ_QUESTIONS } from '@/lib/quiz';
export function QuizStepper() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const currentCategory = QUIZ_STEPS[currentStep].category;
  const questionsInStep = QUIZ_QUESTIONS.filter(q => q.category === currentCategory);
  const isStepComplete = questionsInStep.every(q => {
    const val = answers[q.key];
    return isAnswerValidForQuestion(q, val);
  });
  const handleChange = (key, value) => {
    setSubmitError('');
    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleNext = () => {
    if (currentStep < QUIZ_STEPS.length - 1) {
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
      setSubmitError('');
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          responses: answers
        })
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(typeof payload?.error === 'string' ? payload.error : 'Unable to submit quiz right now.');
      }
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit quiz right now.');
      setIsSubmitting(false);
    }
  };
  const progressPercentage = (currentStep + 1) / QUIZ_STEPS.length * 100;
  return <div className="w-full max-w-xl mx-auto bg-slate-900/50 p-6 md:p-8 rounded-xl border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 text-sm font-medium text-slate-300">
          <span>{QUIZ_STEPS[currentStep].title}</span>
          <span>Step {currentStep + 1} of {QUIZ_STEPS.length}</span>
        </div>
        <Progress value={progressPercentage} className="h-2 bg-slate-800" />
      </div>

      <div className="space-y-6 min-h-[300px]">
        {questionsInStep.map(q => <div key={q.key} className="space-y-2">
            <label htmlFor={q.key} className="block text-sm font-medium text-slate-200">
              {q.question}
            </label>
            {q.type === 'select' ? <select id={q.key} value={answers[q.key] || ''} onChange={e => handleChange(q.key, e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors">
                <option value="" disabled>Select an option</option>
                {q.options?.map(opt => <option key={opt} value={opt}>
                    {opt.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>)}
              </select> : <div className="relative">
                <input id={q.key} type="number" min={q.min} max={q.max} step={q.step} value={answers[q.key] ?? ''} onChange={e => handleChange(q.key, e.target.value ? Number(e.target.value) : '')} className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12" placeholder="0" />
                {q.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
                    {q.unit}
                  </span>}
              </div>}
          </div>)}
      </div>

      {submitError ? <div role="alert" aria-live="polite" className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {submitError}
        </div> : null}

      <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-800">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0 || isSubmitting} className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
          Previous
        </Button>
        
        {currentStep === QUIZ_STEPS.length - 1 ? <Button onClick={handleSubmit} disabled={!isStepComplete || isSubmitting} className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]">
            {isSubmitting ? <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span> : 'Submit'}
          </Button> : <Button onClick={handleNext} disabled={!isStepComplete} className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]">
            Next
          </Button>}
      </div>
    </div>;
}
function isAnswerValidForQuestion(question, value) {
  if (question.type === 'select') {
    return typeof value === 'string' && question.options.includes(value);
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false;
  }
  if (value < question.min || value > question.max) {
    return false;
  }
  if (question.integerOnly && !Number.isInteger(value)) {
    return false;
  }
  return true;
}