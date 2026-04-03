import type { PSPProvider, HistoricalIncident } from '../../types';

interface StatuspageIncidentUpdate {
  body: string;
  status: string;
  created_at: string;
  affected_components: {
    code: string;
    name: string;
    old_status: string;
    new_status: string;
  }[];
}

interface StatuspageIncident {
  id: string;
  name: string;
  status: string;
  impact: string;
  created_at: string;
  updated_at: string;
  started_at: string;
  resolved_at: string | null;
  shortlink: string;
  incident_updates: StatuspageIncidentUpdate[];
}

interface StatuspageIncidentsResponse {
  page: { id: string; name: string };
  incidents: StatuspageIncident[];
}

const CYBERSOURCE_COMPONENT_FILTER = [
  'Payment Gateway Processing',
  'Payment Services',
];

function matchesCyberSourceFilter(incident: StatuspageIncident): boolean {
  for (const update of incident.incident_updates) {
    for (const comp of update.affected_components ?? []) {
      if (CYBERSOURCE_COMPONENT_FILTER.some((f) => comp.name.includes(f))) {
        return true;
      }
    }
  }
  return false;
}

export async function fetchStatuspageHistory(provider: PSPProvider): Promise<HistoricalIncident[]> {
  const res = await fetch(`${provider.apiBaseUrl}/incidents.json?page=1`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: StatuspageIncidentsResponse = await res.json();
  let incidents = data.incidents ?? [];

  // CyberSource: filter to payment-related components only
  if (provider.id === 'cybersource') {
    incidents = incidents.filter(matchesCyberSourceFilter);
  }

  return incidents.map((i) => ({
    id: i.id,
    providerId: provider.id,
    providerName: provider.name,
    title: i.name,
    impact: (i.impact as HistoricalIncident['impact']) || 'none',
    status: (i.status as HistoricalIncident['status']) || 'resolved',
    startedAt: i.started_at || i.created_at,
    resolvedAt: i.resolved_at,
    url: i.shortlink,
  }));
}
