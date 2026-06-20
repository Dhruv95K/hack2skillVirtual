/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock dependencies before importing components
jest.mock('next/link', () => {
  return ({
    children,
    href
  }) => <a href={href}>{children}</a>;
});
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className
    }) => <div className={className}>{children}</div>,
    svg: ({
      children,
      className
    }) => <svg className={className}>{children}</svg>
  },
  useReducedMotion: jest.fn(() => false)
}));

// Mock Shadcn UI components for Navbar
jest.mock('@/components/ui/sheet', () => {
  const React = require('react');
  return {
    Sheet: ({
      children
    }) => <div data-testid="sheet">{children}</div>,
    SheetTrigger: ({
      children
    }) => <button data-testid="sheet-trigger">{children}</button>,
    SheetContent: ({
      children
    }) => <div data-testid="sheet-content">{children}</div>,
    SheetTitle: ({
      children
    }) => <div>{children}</div>,
    SheetDescription: ({
      children
    }) => <div>{children}</div>,
    SheetClose: ({
      render,
      children
    }) => {
      if (render) {
        return React.cloneElement(render, {
          children
        });
      }
      return <button>{children}</button>;
    }
  };
});
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import LandingPage from '@/app/page';
describe('Landing Page Components', () => {
  describe('Navbar', () => {
    it('renders logo and navigation links', () => {
      render(<Navbar />);
      expect(screen.getByText(/EcoTrack/i)).toBeInTheDocument();
      expect(screen.getAllByText('Features').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Get Started').length).toBeGreaterThan(0);
    });
  });
  describe('Hero', () => {
    it('renders the main headline and statistics', () => {
      render(<Hero />);
      expect(screen.getByText(/Understand & Reduce Your/i)).toBeInTheDocument();
      expect(screen.getByText(/Carbon Footprint/i)).toBeInTheDocument();

      // Check metrics
      expect(screen.getByText('500+')).toBeInTheDocument();
      expect(screen.getByText('10k+')).toBeInTheDocument();
      expect(screen.getByText('1000+')).toBeInTheDocument();
    });
    it('renders correctly with reduced motion enabled', () => {
      const framerMotion = require('framer-motion');
      framerMotion.useReducedMotion.mockReturnValueOnce(true);
      render(<Hero />);
      expect(screen.getByText(/Understand & Reduce Your/i)).toBeInTheDocument();
    });
  });
  describe('Features', () => {
    it('renders the three core features', () => {
      render(<Features />);
      expect(screen.getByText(/Everything You Need to Go Green/i)).toBeInTheDocument();
      expect(screen.getByText('Smart Activity Logging')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Insights')).toBeInTheDocument();
      expect(screen.getByText('Gamification & Rewards')).toBeInTheDocument();
    });
    it('renders correctly with reduced motion enabled', () => {
      const framerMotion = require('framer-motion');
      framerMotion.useReducedMotion.mockReturnValueOnce(true);
      render(<Features />);
      expect(screen.getByText('Smart Activity Logging')).toBeInTheDocument();
    });
  });
  describe('Landing Page (Assembly)', () => {
    it('renders the CTA section', () => {
      render(<LandingPage />);
      expect(screen.getByText('Ready to make a difference?')).toBeInTheDocument();
      expect(screen.getByText('Made for Hack2Skill Virtual')).toBeInTheDocument();
    });
  });
});