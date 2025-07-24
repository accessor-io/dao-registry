import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Search, Users, TrendingUp, Shield, Home } from 'lucide-react';
import DAOList from './components/DAOList';
import DAODetail from './components/DAODetail';
import RegistryStats from './components/RegistryStats';
import SearchPage from './components/SearchPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-secondary-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-secondary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-primary-600">DAO Registry</h1>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-secondary-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </a>
                <a href="/search" className="text-secondary-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </a>
                <a href="/stats" className="text-secondary-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Stats
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<DAOList />} />
            <Route path="/dao/:id" element={<DAODetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/stats" element={<RegistryStats />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-secondary-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">DAO Registry</h3>
                <p className="text-secondary-600">
                  Discover and explore decentralized autonomous organizations across multiple blockchain networks.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Features</h3>
                <ul className="space-y-2 text-secondary-600">
                  <li>• Multi-chain DAO discovery</li>
                  <li>• Real-time blockchain data</li>
                  <li>• Governance analytics</li>
                  <li>• Verified DAO listings</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Connect</h3>
                <ul className="space-y-2 text-secondary-600">
                  <li>• GitHub</li>
                  <li>• Discord</li>
                  <li>• Twitter</li>
                  <li>• Documentation</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-secondary-200 text-center text-secondary-500">
              <p>&copy; 2024 DAO Registry. Built with blockchain technology.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 