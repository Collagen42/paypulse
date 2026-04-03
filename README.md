# PayPulse — PSP Status Dashboard

A real-time dashboard that aggregates the public status of major Payment Service Providers (PSPs) into a single view. Built as a portfolio project demonstrating payments domain knowledge.

## What It Does

Payment Operations teams typically monitor 8–12 separate status pages to track PSP health. PayPulse consolidates them into one dashboard with:

- **Provider status cards** — Overall status, component-level breakdown, active incidents per provider
- **Unified incident feed** — All active incidents across all providers, sorted chronologically
- **Summary bar** — At-a-glance "X of Y providers operational" indicator
- **Auto-refresh** — Polls every 60 seconds with a visual countdown
- **Responsive layout** — 3 columns desktop, 2 tablet, 1 mobile

## Providers Integrated

| Provider | Platform | API Type | CORS | Status |
|----------|----------|----------|------|--------|
| Stripe | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Klarna | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Worldpay | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Square | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| PayPal | Custom Node.js SPA | `/api/v1/components` + `/api/v1/events` | Proxied | Working |
| Adyen | Custom Vue.js SPA | `/api/incident-messages/active` | Proxied | Working |

### Provider Notes

- **Statuspage.io providers** use a standardized public JSON API with no authentication or rate limits.
- **PayPal** uses a custom Node.js SPA with its own REST API (`/api/v1/`). Components and events are fetched separately. Includes Braintree, Venmo, Zettle, and Hyperwallet sub-products.
- **Adyen** uses an incident-driven model — if no active incidents exist, all 6 components are operational. Severity levels (GREY/YELLOW/RED) are mapped to the normalized schema.

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 19 + Vite 8 | Fast builds, great DX |
| Language | TypeScript (strict) | Type safety for API response handling |
| Styling | Tailwind CSS 4 | Utility-first, responsive, dark mode |
| State | React hooks | No external state lib needed for this scope |
| CORS Proxy | Vite dev proxy / Cloudflare Pages Functions | PayPal and Adyen block cross-origin requests |

## Architecture

```
Browser
 ├── Direct fetch ──→ Stripe API      (CORS ✓)
 ├── Direct fetch ──→ Klarna API      (CORS ✓)
 ├── Direct fetch ──→ Worldpay API    (CORS ✓)
 ├── Direct fetch ──→ Square API      (CORS ✓)
 ├── CORS proxy   ──→ PayPal API      (CORS ✗)
 └── CORS proxy   ──→ Adyen API       (CORS ✗)
```

In development, Vite's built-in proxy handles CORS-blocked providers. In production, Cloudflare Pages Functions serve as the proxy.

All API responses are normalized to a common schema (`NormalizedStatus`) via adapter functions. Each provider has its own independent polling cycle — one failure doesn't block others.

## Project Structure

```
src/
├── adapters/          # One adapter per API type
│   ├── statuspage.ts  # Handles all Statuspage.io providers
│   ├── paypal.ts      # Custom PayPal adapter (components + events)
│   ├── adyen.ts       # Custom Adyen incident-driven adapter
│   └── index.ts       # Adapter factory/router
├── components/        # React UI components
│   ├── Dashboard.tsx   # Main layout
│   ├── ProviderCard.tsx # Individual PSP card (expandable)
│   ├── SummaryBar.tsx   # Top-level status summary
│   ├── IncidentFeed.tsx # Combined incident timeline
│   ├── StatusBadge.tsx  # Colored status dot + label
│   └── ...
├── config/
│   └── providers.ts   # Provider definitions (add new providers here)
├── hooks/
│   ├── useProviderStatus.ts  # Single provider polling hook
│   └── useDashboard.ts       # Orchestrates all providers
├── types/
│   └── index.ts       # Shared TypeScript interfaces
└── utils/
    ├── statusColors.ts # Status → color/label mapping
    └── timeAgo.ts      # Relative time formatting
```

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 to see the dashboard with live data.

### Build for Production

```bash
npm run build
npm run preview
```

## Adding a New Provider

1. Add an entry to `src/config/providers.ts` with the provider's status page URL and API type
2. If the provider uses Statuspage.io, no adapter code is needed — it works automatically
3. If the provider uses a custom API, create a new adapter in `src/adapters/` and register it in `src/adapters/index.ts`

## Status Color Mapping

| Status | Color | Hex |
|--------|-------|-----|
| Operational | Green | `#22c55e` |
| Degraded Performance | Yellow | `#eab308` |
| Partial Outage | Orange | `#f97316` |
| Major Outage | Red | `#ef4444` |
| Unknown / Error | Gray | `#6b7280` |

## Deployment

Hosted on Cloudflare Pages with Pages Functions providing the CORS proxy for PayPal and Adyen.

```bash
npm run build
npm run deploy
```

Or connect the GitHub repo to Cloudflare Pages for automatic deploys on push.

## What's Next (Planned)

- **Dark/light mode toggle**
- **Historical uptime tracking** — localStorage-based uptime percentages
- **Filtering & search** — Filter by status or provider category
- **Browser notifications** — Alert when a provider status changes
