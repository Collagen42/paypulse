import type { PSPProvider, NormalizedStatus, NormalizedComponent, NormalizedIncident, NormalizedMaintenance } from '../types';
import { buildFetchUrl } from '../utils/fetchUrl';

interface PayPalComponent {
  id: number;
  name: string;
  parentId: number | null;
  category: { name: string };
  status: { production: string; sandbox: string };
}

interface PayPalEvent {
  id: number;
  referenceId: string;
  summary: string;
  body: string;
  environment: string;
  type: string;
  pubDate: string;
  startDate: string;
  endDate: string;
  state: string;
  severity: string;
  impactedComponents: PayPalComponent[];
}

const STATUS_MAP: Record<string, NormalizedComponent['status']> = {
  'Operational': 'operational',
  'Degraded Performance': 'degraded_performance',
  'Partial Outage': 'partial_outage',
  'Major Outage': 'major_outage',
};

const SEVERITY_MAP: Record<string, NormalizedIncident['impact']> = {
  'None': 'none',
  'Minor': 'minor',
  'Major': 'major',
  'Critical': 'critical',
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function fetchPayPalStatus(provider: PSPProvider): Promise<NormalizedStatus> {
  const [componentsRes, eventsRes] = await Promise.all([
    fetch(buildFetchUrl(`${provider.apiBaseUrl}/v1/components`, provider)),
    fetch(buildFetchUrl(`${provider.apiBaseUrl}/v1/events?s=true`, provider)),
  ]);

  if (!componentsRes.ok) throw new Error(`Components HTTP ${componentsRes.status}`);
  if (!eventsRes.ok) throw new Error(`Events HTTP ${eventsRes.status}`);

  const componentsData: { result: PayPalComponent[] } = await componentsRes.json();
  const eventsData: { result: PayPalEvent[] } = await eventsRes.json();

  const components: NormalizedComponent[] = componentsData.result
    .filter((c) => c.parentId === null && c.status.production !== 'None')
    .map((c) => ({
      id: String(c.id),
      name: c.name,
      status: STATUS_MAP[c.status.production] ?? 'operational',
      updatedAt: new Date().toISOString(),
    }));

  const activeEvents = eventsData.result.filter(
    (e) => e.state === 'open' && e.environment === 'production'
  );

  const activeIncidents: NormalizedIncident[] = activeEvents
    .filter((e) => e.type === 'Incident')
    .map((e) => ({
      id: String(e.id),
      name: e.summary,
      status: 'investigating' as const,
      impact: SEVERITY_MAP[e.severity] ?? 'none',
      createdAt: e.pubDate,
      updatedAt: e.pubDate,
      updates: [{
        body: stripHtml(e.body),
        status: 'investigating',
        createdAt: e.pubDate,
      }],
    }));

  const upcomingMaintenances: NormalizedMaintenance[] = activeEvents
    .filter((e) => e.type === 'Maintenance')
    .map((e) => ({
      id: String(e.id),
      name: e.summary,
      scheduledFor: e.startDate,
      scheduledUntil: e.endDate,
      status: e.state,
    }));

  const hasOutage = components.some((c) => c.status === 'major_outage' || c.status === 'partial_outage');
  const hasDegraded = components.some((c) => c.status === 'degraded_performance');

  return {
    providerId: provider.id,
    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
    overall: {
      indicator: hasOutage ? 'major_outage' : hasDegraded ? 'degraded' : 'operational',
      description: hasOutage ? 'Service disruption' : hasDegraded ? 'Degraded performance' : 'All Systems Operational',
    },
    components,
    activeIncidents,
    upcomingMaintenances,
  };
}
