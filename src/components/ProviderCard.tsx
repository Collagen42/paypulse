import { useState } from 'react';
import type { ProviderState } from '../types';
import { providers } from '../config/providers';
import { StatusBadge } from './StatusBadge';
import { ComponentList } from './ComponentList';
import { timeAgo } from '../utils/timeAgo';

interface ProviderCardProps {
  state: ProviderState;
  providerId: string;
}

export function ProviderCard({ state, providerId }: ProviderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const provider = providers.find((p) => p.id === providerId);

  if (!provider) return null;

  const { data, loading, error } = state;

  if (loading && !data) {
    return (
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-700 rounded" />
          <div className="h-5 bg-gray-700 rounded w-24" />
        </div>
        <div className="h-4 bg-gray-700 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-700 rounded w-20" />
      </div>
    );
  }

  const status = data?.overall.indicator ?? 'unknown';
  const hasIncidents = (data?.activeIncidents.length ?? 0) > 0;

  return (
    <div
      className={`bg-gray-800 rounded-xl p-5 border border-gray-700 cursor-pointer transition-all hover:border-gray-500 min-w-0 overflow-hidden ${expanded ? 'ring-1 ring-gray-600' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {provider.logo && (
            <img
              src={provider.logo}
              alt={`${provider.name} logo`}
              className="w-10 h-7 object-contain shrink-0"
            />
          )}
          <div>
            <h3 className="text-white font-medium">{provider.name}</h3>
            <span className="text-xs text-gray-500">{provider.category}</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {error && !data && (
        <p className="text-sm text-gray-500 mt-2">Unable to fetch status</p>
      )}

      {data && (
        <p className="text-xs text-gray-500 mt-1">
          {data.overall.description}
          {state.lastFetched && (
            <span className="ml-2">Updated {timeAgo(state.lastFetched)}</span>
          )}
        </p>
      )}

      {hasIncidents && !expanded && (
        <div className="mt-2">
          <span className="text-xs text-yellow-500">
            {data!.activeIncidents.length} active incident{data!.activeIncidents.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {expanded && data && (
        <>
          <ComponentList components={data.components} />
          {data.activeIncidents.length > 0 && (
            <div className="mt-3 border-t border-gray-700 pt-3">
              <p className="text-xs font-medium text-gray-400 mb-2">Active Incidents</p>
              {data.activeIncidents.map((incident) => (
                <div key={incident.id} className="mb-2 text-sm">
                  <p className="text-yellow-400">{incident.name}</p>
                  {incident.updates[0] && (
                    <p className="text-gray-500 text-xs mt-0.5">{incident.updates[0].body}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {expanded && (
        <div className="mt-2 text-center">
          <a
            href={provider.statusPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            View status page
          </a>
        </div>
      )}
    </div>
  );
}
