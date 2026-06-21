# Dashboard UI Upgrade PRD (2026-06-21)

## Goal
Overhaul the authenticated `/dashboard` UI to match the "Organic Biophilic" design system established on the Landing Page. We will use soft curves, glassmorphism, and dynamic Framer Motion micro-animations.

## Proposed Changes

### 1. `src/app/(dashboard)/dashboard/dashboard-client.jsx`
- **Vibrant Header:** Apply a `from-nature-green to-ocean-blue` gradient to the Dashboard title.
- **Bento Stat Cards (4 Columns):**
  - Change the grid from 3 to 4 columns to add a new data point: **"Impact Equivalent"** (e.g., calculating how many "trees saved" based on CO2 tracked).
  - Convert all cards to use `rounded-3xl` for the organic Bento feel.
  - Apply `backdrop-blur-xl bg-surface/50 border-white/5` for a premium glassmorphism effect.
  - Add soft, colorful OKLCH background highlights behind the icons (Leaf, Flame, Trophy).
  - Add Framer Motion micro-interactions (`hover:scale-[1.02]`) so the cards feel interactive and gamified.

### 2. `src/components/charts/co2-trend-chart.jsx`
- **Token Integration:** Replace the hardcoded `#22C55E` green hex codes with CSS variables mapped to our new vibrant `var(--nature-green)`.
- **Tooltip Styling:** Update the hover tooltip to feature a rounded-xl glassmorphism background that matches the Bento cards.

### 3. `src/components/charts/category-donut-chart.jsx`
- **Dynamic Palette:** Update the `COLORS` constant to utilize our new continuous palette, ensuring the donut chart slices perfectly match the Nature Green to Ocean Blue theme.
- **Center Label:** Improve the center text typography to use the new `font-heading` with better spacing.

## Verification Plan
1. `npm run build` to ensure no React/TypeScript errors.
2. Visual check of the local dev server at `/dashboard` to verify layout, contrast, and animations.
