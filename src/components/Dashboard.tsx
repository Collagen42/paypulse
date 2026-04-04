import { useDashboard } from '../hooks/useDashboard';
import { SummaryBar } from './SummaryBar';
import { ProviderCard } from './ProviderCard';
import { IncidentFeed } from './IncidentFeed';

export function Dashboard() {
  const { providerStates, allIncidents, summary } = useDashboard();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 overflow-hidden">
      <SummaryBar summary={summary} />

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providerStates.map((ps) => (
            <ProviderCard
              key={ps.providerId}
              state={ps}
              providerId={ps.providerId}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-gray-300">Active Incidents</h2>
        <IncidentFeed incidents={allIncidents} />
      </section>
    </main>
  );
}
