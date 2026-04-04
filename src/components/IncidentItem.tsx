import { useState } from 'react';
import type { NormalizedIncident } from '../types';
import { getImpactBgClass } from '../utils/statusColors';
import { timeAgo } from '../utils/timeAgo';

interface IncidentItemProps {
  incident: NormalizedIncident & { providerName: string };
}

export function IncidentItem({ incident }: IncidentItemProps) {
  const [expanded, setExpanded] = useState(false);
  const latestUpdate = incident.updates[0];

  return (
    <div
      className="bg-gray-800 rounded-lg p-4 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors min-w-0 overflow-hidden"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${getImpactBgClass(incident.impact)}`} />
            <span className="text-xs text-gray-500 font-medium">{incident.providerName}</span>
            <span className="text-xs text-gray-600">{timeAgo(incident.updatedAt)}</span>
          </div>
          <h4 className="text-sm text-white font-medium truncate">{incident.name}</h4>
          {latestUpdate && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{latestUpdate.body}</p>
          )}
        </div>
        <span className="text-xs text-gray-500 capitalize shrink-0">{incident.status}</span>
      </div>

      {expanded && incident.updates.length > 1 && (
        <div className="mt-3 border-t border-gray-700 pt-3 space-y-2">
          {incident.updates.map((update, i) => (
            <div key={i} className="text-xs">
              <div className="flex items-center gap-2 text-gray-500">
                <span className="capitalize font-medium">{update.status}</span>
                <span>{timeAgo(update.createdAt)}</span>
              </div>
              <p className="text-gray-400 mt-0.5">{update.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
