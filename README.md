# PSP Monitor — PSP Status Dashboard

**Live:** [paypulse-2ma.pages.dev](https://paypulse-2ma.pages.dev/)
**Repo:** [github.com/DoeberlD/PSP-Monitor](https://github.com/DoeberlD/PSP-Monitor)

A real-time dashboard that aggregates the public status of major Payment Service Providers (PSPs) into a single view. Built as a portfolio project demonstrating payments domain knowledge.

## What It Does

Payment Operations teams typically monitor 8-12 separate status pages to track PSP health. PSP Monitor consolidates them into one dashboard with three tabs:

### Live Status
- **Provider status cards** — Overall status, component-level breakdown, active incidents per provider
- **Unified incident feed** — All active incidents across all providers, sorted chronologically
- **Summary bar** — At-a-glance "X of Y providers operational" indicator
- **Auto-refresh** — Polls every 180 seconds (3 minutes) with animated countdown indicator
- **Responsive layout** — 3 columns desktop, 2 tablet, 1 mobile

### Incident History
- **Monthly calendar view** — Navigate between months to see historical incidents
- **Severe incident summary** — Aggregated downtime minutes for major/critical incidents per month
- **Day cells** — Show incident severity dots, provider name, title, and time range
- **Detail modal** — Click any day to see full incident details in a popup
- **Multi-day incidents** — Incidents spanning multiple days appear in all overlapping cells
- **9 providers** — Stripe, Klarna, Worldpay, CyberSource, PayPal, Adyen, Unzer, Google Pay, Worldline

### Community Reports
- **Downdetector links** — Direct links to Austrian Downdetector (allestörungen.at) for Visa, PayPal, Stripe, Klarna, Mastercard
- **Feedback sources** — Drei app store reviews (Kundenzone + Up von Drei), Trustpilot, CHIP, LTE Forum, Firmenhandy.at, Reddit

## Providers Integrated (16)

| Provider | Platform | API Type | CORS | Status |
|----------|----------|----------|------|--------|
| Visa Acceptance Solutions | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Mastercard | Custom | `/apistatus/service-results` | Proxied | Working |
| PayPal | Custom Node.js SPA | `/api/v1/components` + `/api/v1/events` | Proxied | Working |
| Klarna | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Google Pay | Custom Google | `/status/products.json` + `/status/incidents.json` | Direct | Working |
| Apple Pay | Apple System Status | `/support/systemstatus/data/system_status_en_US.js` | Proxied | Working |
| Unzer | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| EPS | Custom HTML | HTML parsing from eservice.psa.at | Proxied | Working |
| PAYONE | Storyblok CMS | Storyblok CDN API | Direct | Working |
| Worldline | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Worldpay | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Stripe | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Square | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| CyberSource (Visa) | Statuspage.io | `/api/v2/summary.json` | Direct | Working |
| Adyen | Custom Vue.js SPA | `/api/incident-messages/active` | Proxied | Working |
| Worldpay Gateway | Statuspage.io | `/api/v2/summary.json` | Direct | Working |

### Provider Notes

- **Statuspage.io providers** (Stripe, Klarna, Worldpay, Square, Visa Acceptance Solutions, CyberSource, Worldpay Gateway, Unzer, Worldline) use a standardized public JSON API with no authentication or rate limits. The adapter handles variations like Square's minimal response (no components/incidents arrays).
- **Visa Acceptance Solutions** and **CyberSource** provide indirect visibility into Visa's card network ecosystem. While Visa does not expose VisaNet status publicly, issues with card processing typically surface through these subsidiary status pages as well as through Stripe's "Acquirers and payment methods" and Adyen's "Payment methods and issuers" components.
- **Worldpay Gateway** (`status.worldpay.com`) is the main Worldpay status page covering Authorization & Payments, Acquiring Services, Funding & Payouts, and Portals & Reporting — separate from the Worldpay for Platforms status page.
- **Mastercard** uses a developer API at `developer.mastercard.com/apistatus` with service-level pass/fail results. The adapter filters to 10 key payment services (Gateway regions, Click To Pay, MDES, Processing, Mastercom).
- **PayPal** uses a custom Node.js SPA with its own REST API (`/api/v1/`). Components and events are fetched separately. Includes Braintree, Venmo, Zettle, and Hyperwallet sub-products. Discovered by reverse-engineering the SPA's bundle.js to find internal API endpoints.
- **Adyen** uses an incident-driven model — if no active incidents exist, all 6 components are operational. Severity levels (GREY/YELLOW/RED) are mapped to the normalized schema. Backend is Contentful CMS; rich text descriptions are extracted to plain text.
- **Apple Pay** is extracted from Apple's general system status page, filtering to payment-related services (Apple Pay, Wallet, Apple Card, Apple Cash).
- **PAYONE** uses Storyblok CMS with a public CDN API token. The adapter fetches the incident-list component from the Austrian status page and maps icon colors (green/yellow/red) to normalized status levels.
- **Google Pay** has a custom status dashboard with a proper JSON API (`products.json` + `incidents.json`). Covers 6 API components (Android/Web CreateButton, IsReadyToPay, LoadPaymentData).
- **EPS** (Austrian online banking payment) has no JSON API. The adapter fetches HTML from the PSA eService status page and parses it using DOMParser to extract ~24 Austrian bank statuses.

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 19 + Vite 8 | Fast builds, great DX |
| Language | TypeScript (strict) | Type safety for API response handling |
| Styling | Tailwind CSS 4 | Utility-first, responsive, dark mode |
| State | React hooks | No external state lib needed for this scope |
| Hosting | Cloudflare Pages | Free tier, auto-deploys from GitHub |
| CORS Proxy | Cloudflare Pages Functions | Proxies PayPal, Adyen, Apple Pay, Mastercard, EPS |
| Dev Proxy | Vite dev server proxy | Same CORS bypass locally without deploying |

## Architecture

```
Browser (Cloudflare Pages)
 ├── Direct fetch ──→ Stripe API              (CORS ✓)
 ├── Direct fetch ──→ Klarna API              (CORS ✓)
 ├── Direct fetch ──→ Worldpay API            (CORS ✓)
 ├── Direct fetch ──→ Square API              (CORS ✓)
 ├── Direct fetch ──→ Visa Acceptance API     (CORS ✓)
 ├── Direct fetch ──→ CyberSource API         (CORS ✓)
 ├── Direct fetch ──→ Worldpay Gateway API    (CORS ✓)
 ├── Direct fetch ──→ Unzer API               (CORS ✓)
 ├── Direct fetch ──→ Worldline API           (CORS ✓)
 ├── Direct fetch ──→ PAYONE Storyblok API    (CORS ✓)
 ├── Direct fetch ──→ Google Pay API          (CORS ✓)
 ├── Pages Function ──→ PayPal API            (CORS ✗)
 ├── Pages Function ──→ Adyen API             (CORS ✗)
 ├── Pages Function ──→ Apple Pay API         (CORS ✗)
 ├── Pages Function ──→ Mastercard API        (CORS ✗)
 └── Pages Function ──→ EPS (HTML parse)      (CORS ✗)
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
│   ├── statuspage.ts      # Handles all Statuspage.io providers (9)
│   ├── paypal.ts          # Custom PayPal adapter (components + events)
│   ├── adyen.ts           # Custom Adyen incident-driven adapter
│   ├── payone.ts          # Custom PAYONE Storyblok CMS adapter
│   ├── googlepay.ts       # Custom Google Pay JSON API adapter
│   ├── applepay.ts        # Custom Apple Pay system status adapter
│   ├── mastercard.ts      # Custom Mastercard API status adapter
│   ├── eps.ts             # Custom EPS HTML parsing adapter
│   ├── index.ts           # Adapter factory/router
│   └── history/           # Historical incident adapters
│       ├── statuspageHistory.ts  # Statuspage.io incidents.json
│       ├── paypalHistory.ts      # PayPal closed events
│       ├── adyenHistory.ts       # Adyen (graceful degradation)
│       ├── googlepayHistory.ts   # Google Pay incidents.json
│       └── index.ts              # History adapter dispatcher
├── components/            # React UI components
│   ├── Dashboard.tsx      # Live Status tab (grid, incident feed)
│   ├── IncidentHistory.tsx # History tab (month nav, calendar, summary)
│   ├── CommunityReports.tsx # Community tab (link cards)
│   ├── CalendarView.tsx   # Monthly calendar grid
│   ├── CalendarDay.tsx    # Day cell with incident indicators
│   ├── ProviderCard.tsx   # Individual PSP card (expandable)
│   ├── SummaryBar.tsx     # Top-level status summary
│   ├── IncidentFeed.tsx   # Combined incident timeline
│   ├── IncidentItem.tsx   # Single incident display
│   ├── StatusBadge.tsx    # Colored status dot + label
│   ├── ComponentList.tsx  # Component breakdown in expanded card
│   └── RefreshIndicator.tsx # Animated countdown with conic gradient
├── config/
│   └── providers.ts       # Provider definitions (add new providers here)
├── hooks/
│   ├── useProviderStatus.ts  # Single provider polling hook (180s interval)
│   ├── useDashboard.ts      # Orchestrates all providers, aggregates incidents
│   └── useIncidentHistory.ts # Fetches + caches historical incidents
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

Open http://localhost:5173 to see the dashboard with live data from all 16 providers.

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

- **Polling is client-side only** — the 180-second refresh runs via `setInterval` in the browser. When no one has the tab open, zero requests are made. There are no background jobs or server-side cron tasks.
- **Incident History fetches once** — historical data is fetched on first load and cached in memory. No polling, no repeated API calls. Switching tabs reuses the cache.
- **Cloudflare free tier is more than enough** — the Pages Function (CORS proxy) fires for PayPal, Adyen, Apple Pay, Mastercard, and EPS: 5 requests per poll cycle per open tab. The free tier allows 100,000 function invocations/day.
- **PSP APIs won't block you** — Statuspage.io's public Status API has no rate limit (confirmed in Atlassian docs). Proxied providers go through the Cloudflare proxy, which caches responses for 60 seconds, so multiple concurrent users don't multiply upstream calls.

## Adding a New Provider

1. Add an entry to `src/config/providers.ts` with the provider's status page URL and API type
2. If the provider uses Statuspage.io, no adapter code is needed — it works automatically
3. If the provider uses a custom API, create a new adapter in `src/adapters/` and register it in `src/adapters/index.ts`
4. If the provider blocks CORS, set `corsProxy: true` in the config and add the domain to the allowlist in `functions/api/proxy.ts`
5. Add a provider slot in `src/hooks/useDashboard.ts`
6. Optionally add to `src/hooks/useIncidentHistory.ts` for the history calendar

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
- **More providers** — Mollie (Instatus)
