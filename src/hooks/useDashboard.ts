import { useMemo } from 'react';
import { providers } from '../config/providers';
import { useProviderStatus } from './useProviderStatus';
import type { NormalizedIncident, ProviderState } from '../types';

interface DashboardIncident extends NormalizedIncident {
  providerName: string;
  providerId: string;
}

interface DashboardState {
  providerStates: (ProviderState & { providerId: string; providerName: string; refresh: () => void })[];
  allIncidents: DashboardIncident[];
  summary: {
    total: number;
    operational: number;
    degraded: number;
    outage: number;
    loading: number;
    error: number;
  };
}

function useProviderStatusWrapper(provider: typeof providers[number]) {
  const state = useProviderStatus(provider);
  return { ...state, providerId: provider.id, providerName: provider.name };
}

export function useDashboard(): DashboardState {
  // Hooks must be called unconditionally — one per provider slot
  const p0 = useProviderStatusWrapper(providers[0]);
  const p1 = useProviderStatusWrapper(providers[1]);
  const p2 = useProviderStatusWrapper(providers[2]);
  const p3 = useProviderStatusWrapper(providers[3]);
  const p4 = useProviderStatusWrapper(providers[4]);
  const p5 = useProviderStatusWrapper(providers[5]);

  const providerStates = useMemo(() => [p0, p1, p2, p3, p4, p5], [p0, p1, p2, p3, p4, p5]);

  const allIncidents = useMemo(() => {
    const incidents: DashboardIncident[] = [];
    for (const ps of providerStates) {
      if (ps.data) {
        for (const incident of ps.data.activeIncidents) {
          incidents.push({
            ...incident,
            providerName: ps.providerName,
            providerId: ps.providerId,
          });
        }
      }
    }
    return incidents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [providerStates]);

  const summary = useMemo(() => {
    let operational = 0, degraded = 0, outage = 0, loading = 0, error = 0;
    for (const ps of providerStates) {
      if (ps.loading && !ps.data) { loading++; continue; }
      if (ps.error && !ps.data) { error++; continue; }
      if (!ps.data) { loading++; continue; }
      switch (ps.data.overall.indicator) {
        case 'operational': operational++; break;
        case 'degraded': degraded++; break;
        case 'partial_outage':
        case 'major_outage': outage++; break;
      }
    }
    return { total: providerStates.length, operational, degraded, outage, loading, error };
  }, [providerStates]);

  return { providerStates, allIncidents, summary };
}
