import { useState, useEffect, useMemo } from 'react';
import { useIncidentHistory } from '../hooks/useIncidentHistory';
import { CalendarView } from './CalendarView';
import { getImpactBgClass, getImpactColor } from '../utils/statusColors';
import type { HistoricalIncident } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startedAt: string, resolvedAt: string | null): string {
  if (!resolvedAt) return 'Ongoing';
  const ms = new Date(resolvedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
}

function formatMinutes(totalMins: number): string {
  if (totalMins < 60) return `${totalMins}m`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function IncidentHistory() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { incidents, loading, error } = useIncidentHistory();

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedDate) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedDate(null);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [selectedDate]);

  function navigateMonth(delta: number) {
    setSelectedDate(null);
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
  }

  // Calculate severe incident stats for the current month
  const monthStats = useMemo(() => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const severeIncidents = incidents.filter((i) => {
      if (i.impact !== 'major' && i.impact !== 'critical') return false;
      const start = new Date(i.startedAt);
      const end = i.resolvedAt ? new Date(i.resolvedAt) : new Date();
      return start <= monthEnd && end >= monthStart;
    });

    let totalMinutes = 0;
    for (const i of severeIncidents) {
      const start = new Date(Math.max(new Date(i.startedAt).getTime(), monthStart.getTime()));
      const end = new Date(Math.min(
        (i.resolvedAt ? new Date(i.resolvedAt) : new Date()).getTime(),
        monthEnd.getTime(),
      ));
      totalMinutes += Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    }

    return { count: severeIncidents.length, totalMinutes };
  }, [incidents, year, month]);

  // Get incidents for the selected date
  const selectedIncidents: HistoricalIncident[] = selectedDate
    ? incidents.filter((i) => {
        const start = new Date(i.startedAt);
        const end = i.resolvedAt ? new Date(i.resolvedAt) : new Date();
        const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);
        return start <= dayEnd && end >= dayStart;
      })
    : [];

  return (
    <main className="flex-1 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto py-6 space-y-4">

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Monthly severe incident summary */}
      {!loading && (
        monthStats.count > 0 ? (
          <div className="bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2.5 text-sm text-red-200 flex items-center gap-2">
            <span className="bg-red-500 w-2 h-2 rounded-full shrink-0" />
            {monthStats.count} severe incident{monthStats.count > 1 ? 's' : ''} — {formatMinutes(monthStats.totalMinutes)} total downtime in {MONTH_NAMES[month]} {year}
          </div>
        ) : (
          <div className="bg-green-900/20 border border-green-800/50 rounded-lg px-4 py-2.5 text-sm text-green-200 flex items-center gap-2">
            <span className="bg-green-500 w-2 h-2 rounded-full shrink-0" />
            No severe incidents in {MONTH_NAMES[month]} {year}
          </div>
        )
      )}

      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="px-3 py-1.5 text-sm rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          &larr; Prev
        </button>
        <h2 className="text-lg font-semibold text-gray-200">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="px-3 py-1.5 text-sm rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Next &rarr;
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-md min-h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <CalendarView
          year={year}
          month={month}
          incidents={incidents}
          onDayClick={setSelectedDate}
        />
      )}

      {/* Limited data notice */}
      <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg px-4 py-2 text-sm text-yellow-200">
        Historical data is limited for: Adyen, Mastercard, Apple Pay, PAYONE, EPS. Only Live Status incidents are shown.
      </div>

      {/* Day detail modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDate(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Modal */}
          <div
            className="relative bg-gray-800 border border-gray-700 rounded-lg p-5 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-200">
                {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-gray-300 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {selectedIncidents.length === 0 ? (
              <p className="text-sm text-gray-500">No incidents on this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedIncidents.map((incident) => (
                  <div key={incident.id} className="flex items-start gap-3 group">
                    <span
                      className={`${getImpactBgClass(incident.impact)} w-2 h-2 rounded-full mt-1.5 shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 shrink-0">{incident.providerName}</span>
                        {incident.url && (
                          <a
                            href={incident.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            View
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-200">{incident.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs" style={{ color: getImpactColor(incident.impact) }}>
                          {formatDateTime(incident.startedAt)}
                          {incident.resolvedAt ? ` — ${formatDateTime(incident.resolvedAt)}` : ' — Ongoing'}
                        </span>
                        <span className="text-xs text-gray-600">
                          {formatDuration(incident.startedAt, incident.resolvedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
