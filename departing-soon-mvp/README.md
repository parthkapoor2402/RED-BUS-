# redBus · Departing Soon MVP

Interactive prototype of the Shift-first Departing Soon flow.

## Run locally

```bash
npm install
npm run test:phases   # must be green before next phase / deploy
npm run dev
```

## Unit tests (run after every phase)

| Phase | Command | Covers |
|---|---|---|
| 1 Scaffold | `npm run test:phase1` | Route, inventory, T−60 cutoff |
| 2 Screens | `npm run test:phase2` | SRP card shape, free-change tags |
| 3 Flows | `npm run test:phase3` | Shift deltas ₹250→300/200, cancel ladder, caps |
| 4 Polish | `npm run test:phase4` | SHIFT + CANCEL both buttons, fare labels |
| 5 Ship | `npm run test:phase5` | Shift upgrade + cancel→home E2E |
| All | `npm run test:phases` | Sequential gate |

## Deploy

```bash
npm run test:phases && npx vercel --prod
```

## Skills used

- `taste-skill` / `no-ai-design-slop` — anti-slop polish
- `frontend-design` — distinctive UI (brand-faithful redBus)
- `ux-writing` — Shift vs Cancel microcopy
- `vercel-cli` — deployment
