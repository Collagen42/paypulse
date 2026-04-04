const DOWNDETECTOR_BASE = 'https://xn--allestrungen-9ib.at/en/status';

interface LinkCard {
  name: string;
  logo: string;
  url: string;
  description: string;
}

const DOWNDETECTOR_LINKS: LinkCard[] = [
  { name: 'Visa', logo: '/logos/visa.svg', url: `${DOWNDETECTOR_BASE}/visa/`, description: 'Visa outage reports' },
  { name: 'PayPal', logo: '/logos/paypal.svg', url: `${DOWNDETECTOR_BASE}/paypal/`, description: 'PayPal outage reports' },
  { name: 'Stripe', logo: '/logos/stripe.svg', url: `${DOWNDETECTOR_BASE}/stripe/`, description: 'Stripe outage reports' },
  { name: 'Klarna', logo: '/logos/klarna.svg', url: `${DOWNDETECTOR_BASE}/klarna/`, description: 'Klarna outage reports' },
  { name: 'Mastercard', logo: '/logos/visa.svg', url: `${DOWNDETECTOR_BASE}/mastercard/`, description: 'Mastercard outage reports' },
];

const FEEDBACK_LINKS: LinkCard[] = [
  {
    name: 'Trustpilot',
    logo: '/logos/trustpilot.svg',
    url: 'https://www.trustpilot.com',
    description: 'Customer reviews and ratings',
  },
  {
    name: 'Drei Kundenzone (iOS)',
    logo: '/logos/drei.svg',
    url: 'https://apps.apple.com/at/app/kundenzone/id440477229?see-all=reviews&platform=iphone',
    description: 'Kundenzone iOS app reviews',
  },
  {
    name: 'Drei Kundenzone (Android)',
    logo: '/logos/drei.svg',
    url: 'https://play.google.com/store/apps/details?id=com.hutchison3g.at.android.selfcare',
    description: 'Kundenzone Android app reviews',
  },
  {
    name: 'Up von Drei (iOS)',
    logo: '/logos/drei.svg',
    url: 'https://apps.apple.com/at/app/up-von-drei-mobilfunk/id1593180423?see-all=reviews&platform=iphone',
    description: 'Up von Drei iOS app reviews',
  },
  {
    name: 'Up von Drei (Android)',
    logo: '/logos/drei.svg',
    url: 'https://play.google.com/store/apps/details?id=at.drei.up3',
    description: 'Up von Drei Android app reviews',
  },
  {
    name: 'CHIP',
    logo: '/logos/chip.svg',
    url: 'https://www.chip.de/artikel/Bestes-Handy-Netz-in-Oesterreich-Magenta-A1-und-Drei-im-Test_186683519.html',
    description: 'Mobile network test Austria',
  },
  {
    name: 'LTE Forum',
    logo: '/logos/lteforum.svg',
    url: 'https://www.lteforum.at/forum/3-hutchison-austria.13/',
    description: 'Hutchison/Drei community forum',
  },
  {
    name: 'Firmenhandy.at',
    logo: '/logos/firmenhandy.svg',
    url: 'https://firmenhandy.at/business-tarife/drei-business/',
    description: 'Drei business tariff reviews',
  },
  {
    name: 'Reddit r/Austria',
    logo: '/logos/reddit.svg',
    url: 'https://www.reddit.com/r/Austria/comments/1n26rlp/erfahrungen_mit_drei/',
    description: 'Community experiences with Drei',
  },
];

function LinkCardComponent({ card }: { card: LinkCard }) {
  return (
    <a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700/80 hover:border-gray-600 transition-colors group"
    >
      <img
        src={card.logo}
        alt={card.name}
        className="w-10 h-10 object-contain shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
          {card.name}
        </p>
        <p className="text-xs text-gray-500">{card.description}</p>
      </div>
      <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}

export function CommunityReports() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 flex-1">
      {/* Downdetector section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <img src="/logos/downdetector.svg" alt="Downdetector" className="w-8 h-8" />
          <div>
            <h2 className="text-lg font-semibold text-gray-200">Downdetector</h2>
            <p className="text-xs text-gray-500">Real-time user-reported outages (allestörungen.at)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DOWNDETECTOR_LINKS.map((card) => (
            <LinkCardComponent key={card.name} card={card} />
          ))}
        </div>
      </section>

      {/* Feedback sources section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-200">Feedback Sources</h2>
            <p className="text-xs text-gray-500">User reviews, forums, and community discussions</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEEDBACK_LINKS.map((card) => (
            <LinkCardComponent key={card.name} card={card} />
          ))}
        </div>
      </section>
    </main>
  );
}
