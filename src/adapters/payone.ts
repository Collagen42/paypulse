import type { PSPProvider, NormalizedStatus, NormalizedComponent, NormalizedIncident } from '../types';

const STORYBLOK_TOKEN = '5j54l1ZDgLaMxY74NiiISAtt';
const STORY_SLUG = 'AT-de/service/aktuelle-stoerung';

interface IncidentEntry {
  _uid: string;
  icon: string;
  headline: string;
  subline: string;
  icon_bg_color: string;
  text: { plugin?: string; content?: string }[];
  component: string;
}

interface StoryblokResponse {
  story: {
    content: {
      Body: {
        body?: {
          component: string;
          items?: IncidentEntry[];
        }[];
      }[];
    };
  };
}

const COLOR_MAP: Record<string, NormalizedComponent['status']> = {
  'icon--green': 'operational',
  'icon--yellow': 'degraded_performance',
  'icon--orange': 'partial_outage',
  'icon--red': 'major_outage',
};

function findIncidentList(data: StoryblokResponse): IncidentEntry[] {
  const body = data.story?.content?.Body ?? [];
  for (const section of body) {
    const innerBody = section.body ?? [];
    for (const block of innerBody) {
      if (block.component === 'incident-list' && block.items) {
        return block.items;
      }
    }
  }
  return [];
}

export async function fetchPayoneStatus(provider: PSPProvider): Promise<NormalizedStatus> {
  const url = `https://api.storyblok.com/v2/cdn/stories/${STORY_SLUG}?version=published&token=${STORYBLOK_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: StoryblokResponse = await res.json();
  const entries = findIncidentList(data);

  const isOperational = entries.length <= 1 &&
    entries.every((e) => e.icon_bg_color === 'icon--green');

  const components: NormalizedComponent[] = [{
    id: 'payone-services',
    name: 'Payment Services',
    status: isOperational ? 'operational' : 'major_outage',
    updatedAt: new Date().toISOString(),
  }];

  const activeIncidents: NormalizedIncident[] = entries
    .filter((e) => e.icon_bg_color !== 'icon--green')
    .map((e) => ({
      id: e._uid,
      name: e.headline,
      status: 'investigating' as const,
      impact: e.icon_bg_color === 'icon--red' ? 'critical' as const
        : e.icon_bg_color === 'icon--orange' ? 'major' as const
        : 'minor' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updates: e.subline ? [{
        body: e.subline,
        status: 'investigating',
        createdAt: new Date().toISOString(),
      }] : [],
    }));

  const worstColor = entries.reduce((worst, e) => {
    const order = ['icon--red', 'icon--orange', 'icon--yellow', 'icon--green'];
    return order.indexOf(e.icon_bg_color) < order.indexOf(worst) ? e.icon_bg_color : worst;
  }, 'icon--green');

  const overallStatus = COLOR_MAP[worstColor] ?? 'operational';
  const indicatorMap: Record<string, NormalizedStatus['overall']['indicator']> = {
    operational: 'operational',
    degraded_performance: 'degraded',
    partial_outage: 'partial_outage',
    major_outage: 'major_outage',
  };

  return {
    providerId: provider.id,
    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
    overall: {
      indicator: indicatorMap[overallStatus] ?? 'operational',
      description: isOperational ? 'Keine Großstörung bekannt' : entries[0]?.headline ?? 'Service disruption',
    },
    components,
    activeIncidents,
    upcomingMaintenances: [],
  };
}
