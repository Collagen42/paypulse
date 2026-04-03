import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { IncidentHistory } from './components/IncidentHistory';
import { RefreshIndicator } from './components/RefreshIndicator';

type Tab = 'dashboard' | 'history';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight">PayPulse</h1>
              <p className="text-xs text-gray-500">PSP Status Aggregator</p>
            </div>
            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                Live Status
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'history'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                Incident History
              </button>
            </nav>
          </div>
          {activeTab === 'dashboard' && <RefreshIndicator />}
        </div>
      </header>

      {activeTab === 'dashboard' ? <Dashboard /> : <IncidentHistory />}

      <footer className="border-t border-gray-800 px-6 py-4 mt-auto">
        <div className="max-w-6xl mx-auto text-center text-xs text-gray-600">
          PayPulse aggregates public status pages. Not affiliated with any listed provider.
        </div>
      </footer>
    </div>
  );
}

export default App;
