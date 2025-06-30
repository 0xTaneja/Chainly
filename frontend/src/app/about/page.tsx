'use client';

import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  LinkIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  CogIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 mb-6">
            About Attention Futures
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A next-generation DeFi platform that enables leveraged trading based on real-time social media attention scores, 
            powered by Chainlink's oracle infrastructure.
          </p>
        </motion.div>

        {/* Core Concept */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
            Core Innovation
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-gray-200 dark:border-zinc-700">
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">
              Attention Futures transforms social media engagement into tradeable derivatives. By leveraging Chainlink's 
              decentralized oracle network, we fetch real-time attention scores for popular cryptocurrencies across 
              social platforms and enable users to take leveraged positions on attention trends.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              This creates a new asset class where traders can profit from predicting which tokens will capture 
              public attention, independent of their price movements.
            </p>
          </div>
        </motion.section>

        {/* Technical Architecture */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <CogIcon className="h-8 w-8 text-purple-500" />
            Technical Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Smart Contracts</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>AttentionOracle:</strong> Chainlink Functions integration</li>
                <li>• <strong>AttentionFutures:</strong> Leveraged trading logic</li>
                <li>• <strong>ScoreBridge:</strong> Cross-chain CCIP synchronization</li>
                <li>• <strong>DataRefresher:</strong> Automated oracle updates</li>
                <li>• <strong>CircuitBreaker:</strong> Safety mechanisms</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Sources</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>Twitter API:</strong> Real-time social mentions</li>
                <li>• <strong>Reddit API:</strong> Community engagement metrics</li>
                <li>• <strong>News APIs:</strong> Media coverage analysis</li>
                <li>• <strong>Custom Algorithm:</strong> Weighted attention scoring</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Chainlink Integrations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <LinkIcon className="h-8 w-8 text-blue-500" />
            Chainlink Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 text-center">
              <ArrowPathIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Functions</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Serverless compute for fetching and processing social media data from multiple APIs
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 text-center">
              <GlobeAltIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">CCIP</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Cross-chain messaging to synchronize attention scores between Ethereum and Avalanche
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 text-center">
              <CogIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Automation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Time-based triggers ensuring fresh oracle data every 2.5 minutes across all tokens
              </p>
            </div>
          </div>
        </motion.section>

        {/* Supported Tokens */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Supported Assets</h2>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['BTC', 'ETH', 'PEPE', 'DOGE'].map((token) => (
                <div key={token} className="text-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">${token}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">Live Oracle</div>
                </div>
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 text-center">
              All tokens feature automated data refreshing with cross-chain synchronization
            </p>
          </div>
        </motion.section>

        {/* Security Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <ShieldCheckIcon className="h-8 w-8 text-green-500" />
            Security & Safety
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-gray-200 dark:border-zinc-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Built-in Protections</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Circuit breaker pauses trading on stale data</li>
                  <li>• Multi-source data aggregation prevents manipulation</li>
                  <li>• Time-based freshness validation</li>
                  <li>• Cross-chain data consistency checks</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Management</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Configurable leverage limits (2x, 5x, 10x)</li>
                  <li>• Collateral-based position sizing</li>
                  <li>• Automated liquidation mechanisms</li>
                  <li>• Real-time position monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Network Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Network Deployment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                Ethereum Sepolia (Primary)
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm mb-4">
                Houses the main oracle contracts and trading logic. All attention scores are generated here.
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                Oracle: 0x10F2...dC8<br/>
                Futures: 0x715A...8fCE<br/>
                Bridge: 0xE64F...168
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-4">
                Avalanche Fuji (Mirror)
              </h3>
              <p className="text-red-700 dark:text-red-400 text-sm mb-4">
                Receives synchronized oracle data via CCIP for cross-chain trading and arbitrage opportunities.
              </p>
              <div className="text-xs text-red-600 dark:text-red-400 font-mono">
                Oracle: 0x1789...3C4<br/>
                Futures: 0x5908...33<br/>
                Receiver: 0xCFF0...Ff3
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 