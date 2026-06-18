// NOTE: Tailwind CSS v4 (used in this project) uses CSS-based configuration via @theme in globals.css.
// This file is kept as a reference stub. All design tokens are defined in src/app/globals.css.
//
// Design System Colors (Organic Biophilic):
//   background:   #020617
//   surface:      #0F172A
//   surface-2:    #1E293B
//   accent:       #22C55E
//   accent-hover: #16A34A
//   foreground:   #F8FAFC
//
// Fonts:
//   heading: Fira Code (var(--font-fira-code))
//   body:    Fira Sans (var(--font-fira-sans))

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
};

export default config;
