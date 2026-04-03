import type { PSPProvider, NormalizedStatus, NormalizedComponent, NormalizedIncident, NormalizedMaintenance, OverallIndicator } from '../types';
import { buildFetchUrl } from '../utils/fetchUrl';

const INDICATOR_MAP: Record<string, OverallIndicator> = {
  none: 'operational',
  minor: 'degraded',
  major: 'partial_outage',
  critical: 'major_outage',
};

interface StatuspageSummary {
  page: { id: string; name: string; url: string; updated_at: string };
  status: { indicator: string; description: string };
  components: {
    id: string;
    name: string;
    status: string;
    position: number;
    updated_at: string;
    group_id: string | null;
  }[];
  incidents: {
    id: string;
    name: string;
    status: string;
    impact: string;
    created_at: string;
    updated_at: string;
    incident_updates: {
      body: string;
      status: string;
      created_at: string;
    }[];
  }[];
  scheduled_maintenances: {
    id: string;
    name: string;
    scheduled_for: string;
    scheduled_until: string;
    status: string;
  }[];
}

export async function fetchStatuspageStatus(provider: PSPProvider): Promise<NormalizedStatus> {
  const url = buildFetchUrl(`${provider.apiBaseUrl}/summary.json`, provider);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: StatuspageSummary = await res.json();

  const components: NormalizedComponent[] = (data.components ?? [])
    .filter((c) => !c.group_id)
    .map((c) => ({
      id: c.id,
      name: c.name,
      status: (c.status as NormalizedComponent['status']) ?? 'operational',
      updatedAt: c.updated_at,
    }));

  const activeIncidents: NormalizedIncident[] = (data.incidents ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    status: i.status as NormalizedIncident['status'],
    impact: (i.impact as NormalizedIncident['impact']) ?? 'none',
    createdAt: i.created_at,
    updatedAt: i.updated_at,
    updates: i.incident_updates.map((u) => ({
      body: u.body,
      status: u.status,
      createdAt: u.created_at,
    })),
  }));

  const upcomingMaintenances: NormalizedMaintenance[] = (data.scheduled_maintenances ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    scheduledFor: m.scheduled_for,
    scheduledUntil: m.scheduled_until,
    status: m.status,
  }));

  return {
    providerId: provider.id,
    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
    overall: {
      indicator: INDICATOR_MAP[data.status.indicator] ?? 'operational',
      description: data.status.description,
    },
    components,
    activeIncidents,
    upcomingMaintenances,
  };
}
