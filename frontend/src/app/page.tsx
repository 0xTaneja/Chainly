'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AxiomNavigation from '@/components/AxiomNavigation';
import AxiomDashboard from '@/components/AxiomDashboard';
import TokenSelect from '@/components/TokenSelect';
import TradingTerminal from '@/components/TradingTerminal';
import PositionsList from '@/components/PositionsList';

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'markets' | 'trade' | 'positions'>('dashboard');
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string>('BTC');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-axBlack flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const handleStartTrading = () => {
    setCurrentView('markets');
  };

  const handleTokenSelect = (t: string) => {
    setToken(t);
    setCurrentView('trade');
  };

  return (
    <div className="min-h-screen bg-axBlack">
      {/* Navigation */}
      <AxiomNavigation currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AxiomDashboard onStartTrading={handleStartTrading} />
            </motion.div>
          ) : currentView === 'markets' ? (
            <motion.div
              key="markets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TokenSelect onSelect={handleTokenSelect} />
            </motion.div>
          ) : currentView === 'trade' ? (
            <motion.div
              key="trade"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen flex items-center justify-center py-20"
            >
              <TradingTerminal token={token} />
            </motion.div>
          ) : (
            <motion.div
              key="positions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen py-20"
            >
              <div className="max-w-7xl mx-auto px-4">
                <PositionsList />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </main>
    </div>
  );
}
