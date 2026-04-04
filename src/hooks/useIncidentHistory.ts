import { useState, useEffect, useRef } from 'react';
import { providers } from '../config/providers';
import { fetchProviderHistory } from '../adapters/history';
import type { AdyenHistoryResult } from '../adapters/history';
import type { HistoricalIncident } from '../types';

const HISTORY_PROVIDER_IDS = ['stripe', 'klarna', 'worldpay', 'cybersource', 'paypal', 'adyen', 'unzer', 'googlepay', 'worldline'];

// Module-level cache so data survives tab switches
let cachedIncidents: HistoricalIncident[] | null = null;
let cachedAdyenLimited = false;

interface UseIncidentHistoryReturn {
  incidents: HistoricalIncident[];
  loading: boolean;
  error: string | null;
  adyenLimited: boolean;
}

export function useIncidentHistory(): UseIncidentHistoryReturn {
  const [incidents, setIncidents] = useState<HistoricalIncident[]>(cachedIncidents ?? []);
  const [loading, setLoading] = useState(cachedIncidents === null);
  const [error, setError] = useState<string | null>(null);
  const [adyenLimited, setAdyenLimited] = useState(cachedAdyenLimited);
  const fetchedRef = useRef(cachedIncidents !== null);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const historyProviders = providers.filter((p) => HISTORY_PROVIDER_IDS.includes(p.id));

    Promise.allSettled(historyProviders.map((p) => fetchProviderHistory(p)))
      .then((results) => {
        const allIncidents: HistoricalIncident[] = [];
        let adyenIsLimited = false;
        let successCount = 0;

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            successCount++;
            const value = result.value;
            // Check if this is an Adyen result (has 'limited' property)
            if (value && 'limited' in value) {
              const adyenResult = value as AdyenHistoryResult;
              adyenIsLimited = adyenResult.limited;
              allIncidents.push(...adyenResult.incidents);
            } else {
              allIncidents.push(...(value as HistoricalIncident[]));
            }
          }
        });

        if (successCount === 0) {
          setError('Failed to fetch incident history from all providers');
        }

        cachedIncidents = allIncidents;
        cachedAdyenLimited = adyenIsLimited;
        setIncidents(allIncidents);
        setAdyenLimited(adyenIsLimited);
        setLoading(false);
      });
  }, []);

  return { incidents, loading, error, adyenLimited };
}
