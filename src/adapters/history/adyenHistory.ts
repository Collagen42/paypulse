import type { PSPProvider, HistoricalIncident } from '../../types';
import { buildFetchUrl } from '../../utils/fetchUrl';

interface AdyenIncidentStatus {
  status: 'IDENTIFIED' | 'UPDATED' | 'RESOLVED';
  date: string;
}

interface AdyenIncident {
  sys: { id: string };
  title: string;
  date: string;
  resolved: boolean;
  severity: 'GREY' | 'YELLOW' | 'RED';
  incidentStatusCollection: {
    items: AdyenIncidentStatus[];
  };
}

interface AdyenActiveResponse {
  incidentMessageCollection: {
    items: AdyenIncident[];
  };
}

export interface AdyenHistoryResult {
  incidents: HistoricalIncident[];
  limited: boolean;
}

export async function fetchAdyenHistory(provider: PSPProvider): Promise<AdyenHistoryResult> {
  const url = buildFetchUrl(`${provider.apiBaseUrl}/incident-messages/active`, provider);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: AdyenActiveResponse = await res.json();
  const allIncidents = data.incidentMessageCollection.items;

  const incidents: HistoricalIncident[] = allIncidents.map((i) => {
    const statuses = i.incidentStatusCollection.items;
    const resolvedStatus = statuses.find((s) => s.status === 'RESOLVED');

    return {
      id: i.sys.id,
      providerId: provider.id,
      providerName: provider.name,
      title: i.title,
      impact: i.severity === 'RED' ? 'critical' as const : i.severity === 'YELLOW' ? 'minor' as const : 'none' as const,
      status: i.resolved ? 'resolved' as const : 'investigating' as const,
      startedAt: i.date,
      resolvedAt: resolvedStatus?.date ?? null,
      url: 'https://status.adyen.com',
    };
  });

  return { incidents, limited: incidents.length === 0 };
}
