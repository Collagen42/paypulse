export interface PSPProvider {
  id: string;
  name: string;
  logo?: string;
  statusPageUrl: string;
  apiType: 'statuspage_io' | 'instatus' | 'custom' | 'scrape';
  apiBaseUrl: string;
  category: string;
  region?: string;
  corsProxy?: boolean;
}

export interface NormalizedStatus {
  providerId: string;
  providerName: string;
  fetchedAt: string;
  overall: {
    indicator: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
    description: string;
  };
  components: NormalizedComponent[];
  activeIncidents: NormalizedIncident[];
  upcomingMaintenances: NormalizedMaintenance[];
}

export interface NormalizedComponent {
  id: string;
  name: string;
  status: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
  updatedAt: string;
}

export interface NormalizedIncident {
  id: string;
  name: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  createdAt: string;
  updatedAt: string;
  updates: {
    body: string;
    status: string;
    createdAt: string;
  }[];
}

export interface NormalizedMaintenance {
  id: string;
  name: string;
  scheduledFor: string;
  scheduledUntil: string;
  status: string;
}

export interface HistoricalIncident {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  impact: 'none' | 'minor' | 'major' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startedAt: string;
  resolvedAt: string | null;
  url?: string;
}

export type OverallIndicator = NormalizedStatus['overall']['indicator'];
export type ComponentStatus = NormalizedComponent['status'];

export interface ProviderState {
  data: NormalizedStatus | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}
