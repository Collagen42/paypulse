import type { PSPProvider, NormalizedStatus, NormalizedComponent, NormalizedIncident } from '../types';
import { buildFetchUrl } from '../utils/fetchUrl';

interface AppleEvent {
  usersAffected: string;
  epochStartDate: number;
  epochEndDate: number;
  datePosted: string;
  startDate: string;
  endDate: string;
  affectedServices: string[] | null;
  eventStatus: string;
  message: string;
  statusType: string;
}

interface AppleService {
  serviceName: string;
  redirectUrl: string | null;
  events: AppleEvent[];
}

interface AppleStatusResponse {
  services: AppleService[];
}

const PAYMENT_SERVICES = ['Apple Pay', 'Wallet', 'Apple Card', 'Apple Cash'];

export async function fetchApplePayStatus(provider: PSPProvider): Promise<NormalizedStatus> {
  const url = buildFetchUrl(
    `${provider.apiBaseUrl}/support/systemstatus/data/system_status_en_US.js`,
    provider,
  );
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: AppleStatusResponse = await res.json();

  const paymentServices = data.services.filter((s) =>
    PAYMENT_SERVICES.includes(s.serviceName),
  );

  const components: NormalizedComponent[] = paymentServices.map((s) => {
    const hasActiveEvent = s.events.length > 0;
    return {
      id: s.serviceName.toLowerCase().replace(/\s+/g, '-'),
      name: s.serviceName,
      status: hasActiveEvent ? 'major_outage' : 'operational',
      updatedAt: new Date().toISOString(),
    };
  });

  const activeIncidents: NormalizedIncident[] = paymentServices
    .flatMap((s) => s.events.map((e) => ({
      id: `${s.serviceName}-${e.epochStartDate}`,
      name: `${s.serviceName}: ${e.message}`,
      status: 'investigating' as const,
      impact: 'major' as const,
      createdAt: e.startDate || new Date(e.epochStartDate).toISOString(),
      updatedAt: e.datePosted || e.startDate,
      updates: [{
        body: e.message,
        status: e.eventStatus || 'investigating',
        createdAt: e.datePosted || e.startDate,
      }],
    })));

  const hasIssues = activeIncidents.length > 0;

  return {
    providerId: provider.id,
    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
    overall: {
      indicator: hasIssues ? 'major_outage' : 'operational',
      description: hasIssues ? 'Service issue reported' : 'All Systems Operational',
    },
    components,
    activeIncidents,
    upcomingMaintenances: [],
  };
}
