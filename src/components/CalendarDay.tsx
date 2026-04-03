import { getImpactBgClass, getImpactColor } from '../utils/statusColors';
import type { HistoricalIncident } from '../types';

interface CalendarDayProps {
  date: Date;
  incidents: HistoricalIncident[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick: (date: Date) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function worstImpact(incidents: HistoricalIncident[]): string {
  const order = ['critical', 'major', 'minor', 'none'];
  for (const level of order) {
    if (incidents.some((i) => i.impact === level)) return level;
  }
  return 'none';
}

export function CalendarDay({ date, incidents, isToday, isCurrentMonth, onClick }: CalendarDayProps) {
  const hasIncidents = incidents.length > 0;
  const worst = hasIncidents ? worstImpact(incidents) : 'none';

  const bgTint = hasIncidents
    ? worst === 'critical' ? 'bg-red-900/20'
      : worst === 'major' ? 'bg-orange-900/20'
      : worst === 'minor' ? 'bg-yellow-900/20'
      : 'bg-gray-800/50'
    : 'bg-gray-800/50';

  return (
    <button
      onClick={() => hasIncidents && onClick(date)}
      className={`
        ${bgTint}
        ${isToday ? 'ring-1 ring-blue-500' : ''}
        ${!isCurrentMonth ? 'opacity-30' : ''}
        ${hasIncidents ? 'cursor-pointer hover:bg-gray-700/50' : 'cursor-default'}
        rounded-md p-1.5 min-h-24 text-left transition-colors flex flex-col
      `}
    >
      <span className={`text-xs font-medium ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>
        {date.getDate()}
      </span>

      <div className="flex-1 mt-1 space-y-0.5 overflow-hidden">
        {incidents.slice(0, 3).map((incident) => (
          <div key={incident.id} className="flex items-start gap-1 min-w-0">
            <span
              className={`${getImpactBgClass(incident.impact)} w-1.5 h-1.5 rounded-full mt-1 shrink-0`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-300 truncate leading-tight">
                <span className="text-gray-500">{incident.providerName.slice(0, 8)}</span>{' '}
                {incident.title}
              </p>
              <p className="text-[9px] leading-tight" style={{ color: getImpactColor(incident.impact) }}>
                {formatTime(incident.startedAt)}
                {incident.resolvedAt ? `–${formatTime(incident.resolvedAt)}` : '–ongoing'}
              </p>
            </div>
          </div>
        ))}
        {incidents.length > 3 && (
          <p className="text-[10px] text-gray-500">+{incidents.length - 3} more</p>
        )}
      </div>
    </button>
  );
}
