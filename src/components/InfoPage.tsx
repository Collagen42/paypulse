export function InfoPage() {
  return (
    <main className="flex-1 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto py-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-3">What is PayUptime?</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            PayUptime is a real-time monitoring dashboard that aggregates the public status of major Payment Service Providers (PSPs) into a single view. Instead of checking 16 separate status pages, you get one unified dashboard showing who's up, who's down, and what's happening across the payment ecosystem.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-3">What does it monitor?</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            PayUptime monitors 16 payment providers across card networks, wallets, gateways, and local payment methods:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              'Visa', 'Mastercard', 'PayPal', 'Klarna',
              'Google Pay', 'Apple Pay', 'Unzer', 'EPS',
              'PAYONE', 'Worldline', 'Worldpay', 'Stripe',
              'Square', 'CyberSource', 'Adyen', 'Worldpay Gateway',
            ].map((name) => (
              <div key={name} className="bg-gray-800/50 rounded-md px-3 py-2 text-xs text-gray-300 text-center">
                {name}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-3">Features</h2>
          <div className="space-y-3">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-200 mb-1">Live Status</h3>
              <p className="text-xs text-gray-400">Real-time status cards for all providers with component-level breakdown, active incident feed, and a summary bar. Auto-refreshes every 3 minutes.</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-200 mb-1">Incident History</h3>
              <p className="text-xs text-gray-400">Monthly calendar view showing historical incidents across providers. Click any day to see incident details including title, duration, and severity. Includes aggregated downtime statistics per month.</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-200 mb-1">Community Reports</h3>
              <p className="text-xs text-gray-400">Quick links to Downdetector outage reports, app store reviews, forums, and other community feedback sources for real-world user sentiment.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-3">How does it work?</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            PayUptime fetches data from each provider's public status API directly in your browser. No accounts, no API keys, no backend servers. Most providers use Statuspage.io's public JSON API. Others (PayPal, Adyen, Apple Pay, Mastercard, EPS) use custom APIs accessed through a lightweight CORS proxy. All data is normalized into a common format for consistent display.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-200 mb-3">Who is it for?</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">&#x2022;</span>
              <span><strong className="text-gray-300">Payment Operations teams</strong> — monitor PSP health across your provider stack from one screen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">&#x2022;</span>
              <span><strong className="text-gray-300">Merchants &amp; e-commerce</strong> — quickly check if a checkout issue is on your end or the provider's</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">&#x2022;</span>
              <span><strong className="text-gray-300">Developers</strong> — see which payment APIs are experiencing issues before debugging your integration</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
