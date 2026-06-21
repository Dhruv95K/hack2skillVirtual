# UI Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the EcoTrack dashboard into a vibrant, high-performance "Bento Grid Showcase" that feels organic, inviting, and gamified across both light and dark modes.

**Architecture:** We will implement a continuous palette system (Nature Green + Ocean Blue) utilizing Tailwind v4's OKLCH color spaces to ensure vibrant dark and light modes. Layouts will be refactored into a responsive Bento Grid using CSS Grid and Flexbox. Animations will rely on Framer Motion with careful orchestration (e.g., staggered fades, ease-out transitions) and strict adherence to `prefers-reduced-motion` for accessibility and performance.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, Framer Motion, shadcn/ui.

---

### Task 1: Update Global Design System (Tokens & Colors)

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Write the updated tokens**
Inject the vibrant Nature Green (`oklch(0.65 0.18 160)`) and Ocean Blue (`oklch(0.6 0.15 230)`) into the root and dark theme blocks. Update root transition tokens for smooth hover effects.

**Step 2: Verify changes**
Run: `npm run dev`
Expected: App runs, and background/foreground colors show higher contrast and vibrance.

**Step 3: Commit**
```bash
git add src/app/globals.css
git commit -m "style: implement vibrant OKLCH color system for light and dark modes"
```

### Task 2: Refactor Landing Hero Section (Gamified & Organic)

**Files:**
- Modify: `src/components/landing/hero.jsx`

**Step 1: Implement new layout & animation**
Replace static background SVGs with a layered "glassmorphism" element behind the text. Update the primary CTA to have a bounce/scale effect on hover. Add a dynamic gamification badge teaser floating near the hero text.

**Step 2: Verify changes**
Run: `npm run dev`
Expected: Hero is visually striking, animations are smooth, button hovers pop.

**Step 3: Commit**
```bash
git add src/components/landing/hero.jsx
git commit -m "feat(ui): upgrade hero section with glassmorphism and dynamic animations"
```

### Task 3: Implement Bento Grid Features Section

**Files:**
- Modify: `src/components/landing/features.jsx`

**Step 1: Build Bento structure**
Convert the 3-column grid into a CSS Grid-based Bento layout (e.g., `grid-cols-4` on desktop, spanning different rows/cols for visual hierarchy).

**Step 2: Add interactive cards**
Build organic rounded cards (`rounded-3xl`) with Framer Motion staggered entry. Ensure each card emphasizes one core flow (Logging, Insights, Gamification).

**Step 3: Verify changes**
Run: `npm run dev`
Expected: Features section displays as a beautiful, asymmetrical bento grid.

**Step 4: Commit**
```bash
git add src/components/landing/features.jsx
git commit -m "feat(ui): convert features section to bento grid showcase"
```

### Task 4: Performance & Accessibility Audit

**Files:**
- Modify: `src/components/landing/hero.jsx`
- Modify: `src/components/landing/features.jsx`

**Step 1: Implement `prefers-reduced-motion`**
Ensure all Framer Motion instances respect `useReducedMotion()`. 

**Step 2: Verify Contrast & Perf**
Audit light/dark contrast manually.

**Step 3: Commit**
```bash
git commit -a -m "chore(ui): optimize animations for performance and accessibility"
```
