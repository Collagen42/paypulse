import { useMemo } from 'react';
import { CalendarDay } from './CalendarDay';
import type { HistoricalIncident } from '../types';

interface CalendarViewProps {
  year: number;
  month: number; // 0-indexed
  incidents: HistoricalIncident[];
  onDayClick: (date: Date) => void;
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function incidentOverlapsDay(incident: HistoricalIncident, dayStart: Date, dayEnd: Date): boolean {
  const start = new Date(incident.startedAt);
  const end = incident.resolvedAt ? new Date(incident.resolvedAt) : new Date();
  return start <= dayEnd && end >= dayStart;
}

export function CalendarView({ year, month, incidents, onDayClick }: CalendarViewProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const { cells } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday = 0, Sunday = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Leading days from previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      cells.push({ date: d, isCurrentMonth: false });
    }

    // Days of the current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }

    // Trailing days to fill last row
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        cells.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }
    }

    return { cells };
  }, [year, month]);

  const incidentsByDay = useMemo(() => {
    const map = new Map<string, HistoricalIncident[]>();

    for (const cell of cells) {
      const dayStart = startOfDay(cell.date);
      const dayEnd = endOfDay(cell.date);
      const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;

      const dayIncidents = incidents.filter((i) => incidentOverlapsDay(i, dayStart, dayEnd));
      if (dayIncidents.length > 0) {
        map.set(key, dayIncidents);
      }
    }

    return map;
  }, [cells, incidents]);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-xs text-gray-500 text-center py-2 font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const isToday = key === todayStr;
          const dayIncidents = incidentsByDay.get(key) ?? [];

          return (
            <CalendarDay
              key={key}
              date={cell.date}
              incidents={dayIncidents}
              isToday={isToday}
              isCurrentMonth={cell.isCurrentMonth}
              onClick={onDayClick}
            />
          );
        })}
      </div>
    </div>
  );
}
