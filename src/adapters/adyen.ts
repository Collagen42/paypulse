import type { PSPProvider, NormalizedStatus, NormalizedComponent, NormalizedIncident, OverallIndicator } from '../types';
import { buildFetchUrl } from '../utils/fetchUrl';

const ADYEN_COMPONENTS: Record<string, string> = {
  PLATFORM_AVAILABILITY: 'Payments',
  ACQUIRER_PAYMENTS_PERFORMANCE: 'Payment methods and issuers',
  CUSTOMER_AREA_REPORTING: 'Interfaces and reporting',
  SETTLEMENT_PAYOUT: 'Settlement and payouts',
  ADYEN_FOR_PLATFORMS: 'Adyen for Platforms',
  FINANCIAL_PRODUCTS: 'Financial products',
};

const SEVERITY_MAP: Record<string, NormalizedComponent['status']> = {
  GREY: 'operational',
  YELLOW: 'degraded_performance',
  RED: 'major_outage',
};

interface ContentfulRichText {
  content: {
    content?: {
      nodeType: string;
      value?: string;
    }[];
  }[];
}

interface AdyenIncidentStatus {
  __typename: 'IncidentStatus';
  sys: { id: string };
  description: { json: ContentfulRichText };
  status: 'IDENTIFIED' | 'UPDATED' | 'RESOLVED';
  date: string;
}

interface AdyenIncident {
  sys: { id: string };
  title: string;
  date: string;
  resolved: boolean;
  systemAffected: string;
  severity: 'GREY' | 'YELLOW' | 'RED';
  downtimeDuration: number | null;
  downtimePercentage: number | null;
  incidentStatusCollection: {
    items: AdyenIncidentStatus[];
  };
}

interface AdyenActiveResponse {
  incidentMessageCollection: {
    items: AdyenIncident[];
  };
}

function extractText(richText: ContentfulRichText): string {
  return richText.content
    .flatMap((block) => block.content ?? [])
    .filter((node) => node.nodeType === 'text')
    .map((node) => node.value ?? '')
    .join(' ');
}

export async function fetchAdyenStatus(provider: PSPProvider): Promise<NormalizedStatus> {
  const url = buildFetchUrl(`${provider.apiBaseUrl}/incident-messages/active`, provider);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: AdyenActiveResponse = await res.json();
  const incidents = data.incidentMessageCollection.items;

  const componentStatuses: NormalizedComponent[] = Object.entries(ADYEN_COMPONENTS).map(([key, name]) => {
    const affecting = incidents.filter((i) => i.systemAffected === key && !i.resolved);
    const worstSeverity = affecting.length > 0
      ? affecting.some((i) => i.severity === 'RED') ? 'RED'
        : affecting.some((i) => i.severity === 'YELLOW') ? 'YELLOW'
        : 'GREY'
      : 'GREY';

    return {
      id: key,
      name,
      status: SEVERITY_MAP[worstSeverity] ?? 'operational',
      updatedAt: affecting[0]?.date ?? new Date().toISOString(),
    };
  });

  const activeIncidents: NormalizedIncident[] = incidents
    .filter((i) => !i.resolved)
    .map((i) => ({
      id: i.sys.id,
      name: i.title,
      status: (i.incidentStatusCollection.items[0]?.status.toLowerCase() ?? 'investigating') as NormalizedIncident['status'],
      impact: SEVERITY_MAP[i.severity] === 'major_outage' ? 'critical' as const : 'minor' as const,
      createdAt: i.date,
      updatedAt: i.incidentStatusCollection.items[0]?.date ?? i.date,
      updates: i.incidentStatusCollection.items.map((s) => ({
        body: extractText(s.description.json),
        status: s.status.toLowerCase(),
        createdAt: s.date,
      })),
    }));

  const hasRed = componentStatuses.some((c) => c.status === 'major_outage');
  const hasYellow = componentStatuses.some((c) => c.status === 'degraded_performance');
  const overall: OverallIndicator = hasRed ? 'major_outage' : hasYellow ? 'degraded' : 'operational';

  return {
    providerId: provider.id,
    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
    overall: {
      indicator: overall,
      description: hasRed ? 'Severely degraded' : hasYellow ? 'Degraded performance' : 'All Systems Operational',
    },
    components: componentStatuses,
    activeIncidents,
    upcomingMaintenances: [],
  };
}
