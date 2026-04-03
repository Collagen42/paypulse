import type { PSPProvider } from '../types';

export function buildFetchUrl(url: string, provider: PSPProvider): string {
  if (!provider.corsProxy || import.meta.env.DEV) return url;
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}
