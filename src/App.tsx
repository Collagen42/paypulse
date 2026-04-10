import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { IncidentHistory } from './components/IncidentHistory';
import { CommunityReports } from './components/CommunityReports';
import { InfoPage } from './components/InfoPage';
import { PSPComparison } from './components/PSPComparison';
import { RefreshIndicator } from './components/RefreshIndicator';

type Tab = 'dashboard' | 'history' | 'community' | 'compare' | 'info';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto">
          {/* Top row: title + refresh */}
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setActiveTab('dashboard')}>PayUptime</h1>
            <div className="flex items-center gap-3">
              {activeTab === 'dashboard' && <RefreshIndicator />}
              <p className="text-xs text-gray-500 hidden sm:block">Next Update</p>
            </div>
          </div>
          {/* Nav row */}
          <nav className="flex gap-1 sm:mt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              Live Status
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'community'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              Community
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'compare'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              Compare
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'info'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              Info
            </button>
          </nav>
        </div>
      </header>

      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'history' && <IncidentHistory />}
      {activeTab === 'community' && <CommunityReports />}
      {activeTab === 'compare' && <PSPComparison />}
      {activeTab === 'info' && <InfoPage />}

      <footer className="border-t border-gray-800 px-4 sm:px-6 py-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs text-gray-600">
          <span>&copy; Daniel Doeberl, 2026.</span>
          <span>PayUptime aggregates public status pages. Not affiliated with any listed provider.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
