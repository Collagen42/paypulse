# PSP Monitor — PSP Status Dashboard

**Live:** [paypulse-2ma.pages.dev](https://paypulse-2ma.pages.dev/)
**Repo:** [github.com/DoeberlD/PSP-Aggregator](https://github.com/DoeberlD/PSP-Aggregator)

A real-time dashboard that aggregates the public status of major Payment Service Providers (PSPs) into a single view. Built as a portfolio project demonstrating payments domain knowledge.

## What It Does

Payment Operations teams typically monitor 8-12 separate status pages to track PSP health. PSP Monitor consolidates them into one dashboard with:

- **Provider status cards** — Overall status, component-level breakdown, active incidents per provider
- **Unified incident feed** — All active incidents across all providers, sorted chronologically
- **Summary bar** — At-a-glance "X of Y providers operational" indicator
- **Auto-refresh** — Polls every 60 seconds with a visual countdown
- **Responsive layout** — 3 columns desktop, 2 tablet, 1 mobile

## Providers Integrated (8)

| Provider | Platform | API Type | CORS | Status |
|----------|----------|----------|------|--------|
| Stripe | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Klarna | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Worldpay | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Square | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Visa Acceptance Solutions | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| CyberSource (Visa) | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| PayPal | Custom Node.js SPA | `/api/v1/components` + `/api/v1/events` | Proxied | Working |
| Adyen | Custom Vue.js SPA | `/api/incident-messages/active` | Proxied | Working |

### Provider Notes

- **Statuspage.io providers** (Stripe, Klarna, Worldpay, Square, Visa Acceptance Solutions, CyberSource) use a standardized public JSON API with no authentication or rate limits. The adapter handles variations like Square's minimal response (no components/incidents arrays).
- **Visa Acceptance Solutions** and **CyberSource** provide indirect visibility into Visa's card network ecosystem. While Visa does not expose VisaNet status publicly, issues with card processing typically surface through these subsidiary status pages as well as through Stripe's "Acquirers and payment methods" and Adyen's "Payment methods and issuers" components.
- **PayPal** uses a custom Node.js SPA with its own REST API (`/api/v1/`). Components and events are fetched separately. Includes Braintree, Venmo, Zettle, and Hyperwallet sub-products. Discovered by reverse-engineering the SPA's bundle.js to find internal API endpoints.
- **Adyen** uses an incident-driven model — if no active incidents exist, all 6 components are operational. Severity levels (GREY/YELLOW/RED) are mapped to the normalized schema. Backend is Contentful CMS; rich text descriptions are extracted to plain text.

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 19 + Vite 8 | Fast builds, great DX |
| Language | TypeScript (strict) | Type safety for API response handling |
| Styling | Tailwind CSS 4 | Utility-first, responsive, dark mode |
| State | React hooks | No external state lib needed for this scope |
| Hosting | Cloudflare Pages | Free tier, auto-deploys from GitHub |
| CORS Proxy | Cloudflare Pages Functions | Proxies PayPal and Adyen (which block cross-origin requests) |
| Dev Proxy | Vite dev server proxy | Same CORS bypass locally without deploying |

## Architecture

```
Browser (Cloudflare Pages)
 ├── Direct fetch ──→ Stripe API      (CORS ✓)
 ├── Direct fetch ──→ Klarna API      (CORS ✓)
 ├── Direct fetch ──→ Worldpay API    (CORS ✓)
 ├── Direct fetch ──→ Square API      (CORS ✓)
 ├── Pages Function ──→ PayPal API    (CORS ✗)
 └── Pages Function ──→ Adyen API     (CORS ✗)
```

- In **development**, Vite's built-in proxy handles CORS-blocked providers
- In **production**, Cloudflare Pages Functions serve as the proxy (`functions/api/proxy.ts`)
- The proxy allowlists only known PSP domains and caches responses for 60 seconds
- All API responses are normalized to a common schema (`NormalizedStatus`) via adapter functions
- Each provider has its own independent polling cycle — one failure doesn't block others

## Project Structure

```
src/
├── adapters/              # One adapter per API type
│   ├── statuspage.ts      # Handles all Statuspage.io providers
│   ├── paypal.ts          # Custom PayPal adapter (components + events)
│   ├── adyen.ts           # Custom Adyen incident-driven adapter
│   └── index.ts           # Adapter factory/router
├── components/            # React UI components
│   ├── Dashboard.tsx      # Main layout (header, grid, incident feed)
│   ├── ProviderCard.tsx   # Individual PSP card (expandable)
│   ├── SummaryBar.tsx     # Top-level status summary
│   ├── IncidentFeed.tsx   # Combined incident timeline
│   ├── IncidentItem.tsx   # Single incident display
│   ├── StatusBadge.tsx    # Colored status dot + label
│   ├── ComponentList.tsx  # Component breakdown in expanded card
│   └── RefreshIndicator.tsx # Countdown to next refresh
├── config/
│   └── providers.ts       # Provider definitions (add new providers here)
├── hooks/
│   ├── useProviderStatus.ts  # Single provider polling hook (60s interval)
│   └── useDashboard.ts      # Orchestrates all providers, aggregates incidents
├── types/
│   └── index.ts           # Shared TypeScript interfaces
└── utils/
    ├── fetchUrl.ts        # Proxy-aware URL builder for production
    ├── statusColors.ts    # Status -> color/label mapping
    └── timeAgo.ts         # Relative time formatting
functions/
└── api/
    └── proxy.ts           # Cloudflare Pages Function (CORS proxy)
```

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 to see the dashboard with live data from all 6 providers.

### Build for Production

```bash
npm run build
npm run preview
```

## Deployment

Hosted on [Cloudflare Pages](https://pages.cloudflare.com/) with automatic deploys on push to `main`.

**Setup:** Cloudflare Dashboard > Pages > Create project > Connect to GitHub repo > Build command: `npm run build` > Output directory: `dist`

Cloudflare Pages automatically detects the `functions/` directory and deploys the CORS proxy as a Pages Function.

### Resource Usage & Rate Limits

- **Polling is client-side only** — the 60-second refresh runs via `setInterval` in the browser. When no one has the tab open, zero requests are made. There are no background jobs or server-side cron tasks.
- **Cloudflare free tier is more than enough** — the Pages Function (CORS proxy) only fires for PayPal and Adyen: 2 requests/minute per open tab. The free tier allows 100,000 function invocations/day.
- **PSP APIs won't block you** — Statuspage.io's public Status API has no rate limit (confirmed in Atlassian docs). PayPal and Adyen requests go through the Cloudflare proxy, which caches responses for 60 seconds, so multiple concurrent users don't multiply upstream calls.

## Adding a New Provider

1. Add an entry to `src/config/providers.ts` with the provider's status page URL and API type
2. If the provider uses Statuspage.io, no adapter code is needed — it works automatically
3. If the provider uses a custom API, create a new adapter in `src/adapters/` and register it in `src/adapters/index.ts`
4. If the provider blocks CORS, set `corsProxy: true` in the config and add the domain to the allowlist in `functions/api/proxy.ts`
5. Add a provider slot in `src/hooks/useDashboard.ts`

## Status Color Mapping

| Status | Color | Hex |
|--------|-------|-----|
| Operational | Green | `#22c55e` |
| Degraded Performance | Yellow | `#eab308` |
| Partial Outage | Orange | `#f97316` |
| Major Outage | Red | `#ef4444` |
| Unknown / Error | Gray | `#6b7280` |

## What's Next (Planned)

- **Dark/light mode toggle**
- **Historical uptime tracking** — localStorage-based uptime percentages
- **Filtering & search** — Filter by status or provider category
- **Browser notifications** — Alert when a provider status changes
- **More providers** — Mollie (Instatus), Visa Acceptance Solutions, CyberSource
