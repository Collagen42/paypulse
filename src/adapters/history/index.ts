import type { PSPProvider, HistoricalIncident } from '../../types';
import { fetchStatuspageHistory } from './statuspageHistory';
import { fetchPayPalHistory } from './paypalHistory';
import { fetchAdyenHistory } from './adyenHistory';
import type { AdyenHistoryResult } from './adyenHistory';

export type { AdyenHistoryResult };

export async function fetchProviderHistory(
  provider: PSPProvider,
): Promise<HistoricalIncident[] | AdyenHistoryResult> {
  switch (provider.apiType) {
    case 'statuspage_io':
      return fetchStatuspageHistory(provider);
    case 'custom':
      if (provider.id === 'paypal') return fetchPayPalHistory(provider);
      if (provider.id === 'adyen') return fetchAdyenHistory(provider);
      return [];
    default:
      return [];
  }
}
