import type { PSPProvider, HistoricalIncident } from '../../types';
import { buildFetchUrl } from '../../utils/fetchUrl';

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
}

const SEVERITY_MAP: Record<string, HistoricalIncident['impact']> = {
  'None': 'none',
  'Minor': 'minor',
  'Major': 'major',
  'Critical': 'critical',
  'Service Disruption': 'major',
};

export async function fetchPayPalHistory(provider: PSPProvider): Promise<HistoricalIncident[]> {
  const url = buildFetchUrl(
    `${provider.apiBaseUrl}/v1/events?state=closed&type=Incident&env=production`,
    provider,
  );
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: { result: PayPalEvent[] } = await res.json();

  return (data.result ?? [])
    .filter((e) => e.environment === 'production' && e.type === 'Incident')
    .map((e) => ({
      id: String(e.id),
      providerId: provider.id,
      providerName: provider.name,
      title: e.summary,
      impact: SEVERITY_MAP[e.severity] ?? 'none',
      status: 'resolved' as const,
      startedAt: e.startDate,
      resolvedAt: e.endDate || null,
      url: `https://www.paypal-status.com/history/production`,
    }));
}
