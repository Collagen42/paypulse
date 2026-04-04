interface SummaryBarProps {
  summary: {
    total: number;
    operational: number;
    degraded: number;
    outage: number;
    loading: number;
    error: number;
  };
}

export function SummaryBar({ summary }: SummaryBarProps) {
  const { total, operational, degraded, outage, loading: loadingCount } = summary;

  const allLoading = loadingCount === total;
  const allOperational = operational === total;
  const issueCount = degraded + outage;

  let bgColor = 'bg-green-900/50 border-green-700';
  let textColor = 'text-green-400';
  let message = `All ${total} providers operational`;

  if (allLoading) {
    bgColor = 'bg-gray-800 border-gray-700';
    textColor = 'text-gray-400';
    message = 'Loading provider statuses...';
  } else if (outage > 0) {
    bgColor = 'bg-red-900/50 border-red-700';
    textColor = 'text-red-400';
    message = `${issueCount} provider${issueCount > 1 ? 's' : ''} experiencing issues`;
  } else if (degraded > 0) {
    bgColor = 'bg-yellow-900/50 border-yellow-700';
    textColor = 'text-yellow-400';
    message = `${degraded} provider${degraded > 1 ? 's' : ''} with degraded performance`;
  } else if (!allOperational) {
    message = `${operational} of ${total} providers operational`;
  }

  return (
    <div className={`rounded-lg border px-4 py-2.5 overflow-hidden ${bgColor}`}>
      <p className={`text-sm font-medium ${textColor}`}>{message}</p>
    </div>
  );
}
