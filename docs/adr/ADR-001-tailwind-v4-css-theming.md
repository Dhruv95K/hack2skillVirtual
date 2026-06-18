# ADR-001: Tailwind CSS v4 and CSS-Based Theme Configuration

## Status
Accepted

## Date
2026-06-19

## Context
The task specification references `tailwind.config.ts` as a file to create for configuring the EcoTrack design system colors. The original intent was to add a custom `theme.extend.colors` block to the standard Tailwind v3 config format.

When running `create-next-app@latest`, the scaffold installed **Next.js 16.2.9** and **Tailwind CSS v4.x** — the latest versions available at the time of scaffolding.

**Tailwind CSS v4 fundamentally changed the configuration approach:**
- There is no `tailwind.config.ts` (or `.js`) as a first-class config file for design tokens
- All design tokens (colors, fonts, spacing) are now defined via the `@theme` CSS directive in a CSS file
- The `tailwind.config.ts` may still exist as a minimal stub for content paths, but is no longer the home of design tokens

## Decision
1. **Keep the scaffold's Tailwind v4** — do not downgrade to v3 to match the spec literally. The app router and Next.js 16 / Tailwind v4 combination is the correct current default.
2. **Define all EcoTrack design tokens in `src/app/globals.css`** using the `@theme` directive:
   ```css
   @theme inline {
     --color-background: #020617;
     --color-surface: #0F172A;
     --color-surface-2: #1E293B;
     --color-accent: #22C55E;
     --color-accent-hover: #16A34A;
     --font-heading: var(--font-fira-code), monospace;
     --font-body: var(--font-fira-sans), sans-serif;
   }
   ```
3. **Create `tailwind.config.ts` as a documentation stub** — it lists content paths and references the design system values in comments, but the actual tokens live in CSS.

## Consequences
- **Positive**: Aligned with the current Tailwind v4 / Next.js 16 ecosystem. Fewer config files to maintain.
- **Positive**: Design tokens are co-located with CSS, making them easier to inspect and override.
- **Negative**: Minor spec deviation — `tailwind.config.ts` exists as a stub rather than the full config the spec describes. This is noted in the file with clear comments.
- **Neutral**: shadcn/ui v2+ supports Tailwind v4, so component installs should work as expected.
