import type { PSPProvider } from '../types';

export const providers: PSPProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '/logos/stripe.svg',
    statusPageUrl: 'https://www.stripestatus.com',
    apiType: 'statuspage_io',
    apiBaseUrl: 'https://www.stripestatus.com/api/v2',
    category: 'Full-Stack PSP',
    region: 'Global',
  },
  {
    id: 'klarna',
    name: 'Klarna',
    logo: '/logos/klarna.svg',
    statusPageUrl: 'https://status.klarna.com',
    apiType: 'statuspage_io',
    apiBaseUrl: 'https://status.klarna.com/api/v2',
    category: 'BNPL',
    region: 'EU / Global',
  },
  {
    id: 'worldpay',
    name: 'Worldpay',
    logo: '/logos/worldpay.svg',
    statusPageUrl: 'https://worldpayforplatforms.statuspage.io',
    apiType: 'statuspage_io',
    apiBaseUrl: 'https://worldpayforplatforms.statuspage.io/api/v2',
    category: 'Full-Stack PSP',
    region: 'Global',
  },
  {
    id: 'square',
    name: 'Square',
    logo: '/logos/square.svg',
    statusPageUrl: 'https://issquareup.com',
    apiType: 'statuspage_io',
    apiBaseUrl: 'https://issquareup.com/api/v2',
    category: 'Full-Stack PSP',
    region: 'US / Global',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: '/logos/paypal.svg',
    statusPageUrl: 'https://www.paypal-status.com',
    apiType: 'custom',
    apiBaseUrl: import.meta.env.DEV
      ? '/proxy/paypal/api'
      : 'https://www.paypal-status.com/api',
    category: 'Wallet / PSP',
    region: 'Global',
    corsProxy: true,
  },
  {
    id: 'adyen',
    name: 'Adyen',
    logo: '/logos/adyen.svg',
    statusPageUrl: 'https://status.adyen.com',
    apiType: 'custom',
    apiBaseUrl: import.meta.env.DEV
      ? '/proxy/adyen/api'
      : 'https://status.adyen.com/api',
    category: 'Full-Stack PSP',
    region: 'EU / Global',
    corsProxy: true,
  },
];
