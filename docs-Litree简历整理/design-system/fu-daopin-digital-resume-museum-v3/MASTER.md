# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Fu Daopin Digital Resume Museum V3
**Generated:** 2026-08-17 16:54:10
**Category:** Autonomous Drone Fleet Manager
**Design Dials:** Variance 9/10 (Bold / Asymmetric) | Motion 10/10 (Complex) | Density 4/10 (Standard)

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#0284C7` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#06B6D4` | `--color-secondary` |
| Accent/CTA | `#0891B2` | `--color-accent` |
| Background | `#F0F9FF` | `--color-background` |
| Foreground | `#0F172A` | `--color-foreground` |
| Muted | `#EFF7FB` | `--color-muted` |
| Border | `#E0F0F8` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#0284C7` | `--color-ring` |

**Color Notes:** Refreshing blue + water cyan

### Typography

- **Heading Font:** Share Tech Mono
- **Body Font:** Fira Code
- **Mood:** tech, futuristic, hud, sci-fi, data, monospaced, precise
- **Google Fonts:** [Share Tech Mono + Fira Code](https://fonts.google.com/share?selection.family=Fira+Code:wght@300;400;500;600;700|Share+Tech+Mono)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
```

### Spacing Variables

*Density: 4/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #0891B2;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0284C7;
  border: 2px solid #0284C7;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #F0F9FF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0284C7;
  outline: none;
  box-shadow: 0 0 0 3px #0284C720;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Bento Grids

**Keywords:** Apple-style, modular, cards, organized, clean, hierarchy, grid, rounded, soft

**Best For:** Product features, dashboards, personal sites, marketing summaries, galleries

**Key Effects:** Hover scale (1.02), soft shadow expansion, smooth layout shifts, content reveal

### Page Pattern

**Pattern Name:** Immersive/Interactive Experience

- **Conversion Strategy:** 40% higher engagement. Performance trade-off. Provide skip option. Mobile fallback essential.
- **CTA Placement:** After interaction complete + Skip option for impatient users
- **Section Order:** 1. Full-screen interactive element, 2. Guided product tour, 3. Key benefits revealed, 4. CTA after completion

---

## Motion

**Hover Micro-interaction** (Complex) — Trigger: hover + mousemove | Duration: 300-500ms | Easing: `elastic.out(1,0.4)`

```js
const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'elastic.out(1,0.4)' }); const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'elastic.out(1,0.4)' }); el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width/2) * 0.3); yTo((e.clientY - r.top - r.height/2) * 0.3); });
```

**Framework notes:** Debounce is not needed since quickTo interpolates; remove listeners on component unmount in React/Vue to avoid leaks

- ✅ Clamp the pull strength (e.g. * 0.3) so the element never fully leaves its hit box
- ❌ Don't apply magnetic effect to more than 1-2 focal elements per screen; it becomes noisy
- ⚡ Use will-change: transform on the target element for smoother compositing

---

## Anti-Patterns (Do NOT Use)

- ❌ Slow updates
- ❌ Poor spatial viz

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
