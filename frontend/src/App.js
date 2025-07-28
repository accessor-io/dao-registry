import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import DAODetail from './components/DAODetail';
import RegistryStats from './components/RegistryStats';
import Documentation from './components/Documentation';
import { Search, BarChart3, Home, Database, BookOpen } from 'lucide-react';
import './App.css';

// Navigation component with active state
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Search DAOs', icon: Search },
    { path: '/stats', label: 'Registry Stats', icon: BarChart3 },
    { path: '/docs', label: 'Documentation', icon: BookOpen },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DAO Registry
              </span>
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/dao/:id" element={<DAODetail />} />
            <Route path="/stats" element={<RegistryStats />} />
            <Route path="/docs" element={<Documentation />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-600 text-sm">
              <p>DAO Registry - Decentralized Autonomous Organization Directory</p>
              <p className="mt-1">Built with modern web technologies and blockchain integration</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 