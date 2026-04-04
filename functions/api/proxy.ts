const ALLOWED_HOSTS = [
  'status.adyen.com',
  'www.paypal-status.com',
  'www.stripestatus.com',
  'status.klarna.com',
  'worldpayforplatforms.statuspage.io',
  'issquareup.com',
  'www.apple.com',
];

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const target = url.searchParams.get('url');

  if (!target) {
    return new Response('Missing ?url= parameter', { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return new Response('Host not allowed', { status: 403 });
  }

  const response = await fetch(target, {
    headers: { 'Accept': 'application/json' },
    cf: { cacheTtl: 60, cacheEverything: true },
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'public, max-age=60',
    },
  });
};
