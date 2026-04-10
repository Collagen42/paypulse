# PSP Status Dashboard (PayUptime)

## What This Is
A React dashboard that aggregates the public status of multiple Payment Service Providers into a single view.

## Tech Stack
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Deployed to Cloudflare Pages (includes Pages Functions for CORS proxy)

## Key Architecture Decisions
- Most PSP status data comes from public Statuspage.io /api/v2/summary.json endpoints
- Adyen uses a custom Vue.js SPA with its own API at status.adyen.com/api — uses incident-driven model
- Provider config is in src/config/providers.ts — add new providers here
- All API responses are normalized to a common schema via adapters in src/adapters/
- Polling interval is 60 seconds via custom React hooks
- No backend — all API calls are browser-side fetch()

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build

## Important Patterns
- Never store API keys or secrets — all endpoints are public
- Handle CORS failures gracefully — show "Unable to fetch" per provider, don't block others
- Each provider gets its own polling cycle — one failure doesn't block others
- Use TypeScript strict mode — no `any` types in adapter or normalizer code

## File Organization
- src/config/ — Provider definitions
- src/adapters/ — One adapter per status page platform type
- src/hooks/ — React polling hooks
- src/components/ — UI components
- src/types/ — Shared TypeScript interfaces
- src/utils/ — Helpers (color mapping, time formatting)
