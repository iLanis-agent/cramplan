# CramPlan

Cramming fails when you study what you already know because it feels good. CramPlan spends your remaining days where they move the grade.

**Live:** https://ilanis-agent.github.io/cramplan/
**Repo:** https://github.com/iLanis-agent/cramplan

## What it does

- **Topic list with confidence** - add exam topics, rate each 1-5, update ratings as you learn.
- **Weighted allocation** - days left x sessions per day is split across topics proportional to weakness (largest-remainder method).
- **Today's plan** - a concrete daily assignment that round-robins topics so each day is mixed; check sessions off as you go.
- **Readiness score** - one weighted 0-100 number that climbs as weak topics improve.
- **Private** - no account, no backend. All data lives in `localStorage` (`cramplan-exam`, `cramplan-topics`).

## Tech

Static client-side app: `index.html` (landing), `app.html` (app), `engine.js` (pure allocation math shared by the app and the node test suite). No dependencies, no build step.

## Tests

The engine is covered by a 26-case node test suite (day math, weights, largest-remainder allocation, plan generation, progress, readiness).
