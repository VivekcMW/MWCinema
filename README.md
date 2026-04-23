# CinemaAds · MW

Static prototype UI for the CinemaAds cinema advertising platform, built with the **Moving Walls** design system.

## Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS (MW tokens: `mw-blue`, `mw-teal`, `mw-orange`, `mw-gray`)
- react-router-dom
- lucide-react (icons — no emojis, no gradients)

## Pages
- `/` Dashboard — KPIs, top movies, activity feed, slot availability by format
- `/ad-slots` Ad Slots — filters + week grid + list view + session drawer
- `/inventory/import` Import schedule — Vista PDF upload pipeline
- `/theaters`, `/screens`, `/movies` — inventory views
- `/campaigns` All campaigns (tabbed: Live / Pending / Scheduled / Draft / Completed)
- `/campaigns/new` 5-step wizard (Brief → Targeting → Inventory → Creative → Review)
- `/dsp` DSP connectors
- `/reports` Analytics

## Shared components (`src/components/ui`)
`Button` · `Card` · `Badge` · `StatCard` · `ProgressBar` · `Field/Input/Select` · `DataTable` · `Stepper` · `PageHeader` · `Drawer` · `Tabs`

## Run
```bash
npm install
npm run dev
```
