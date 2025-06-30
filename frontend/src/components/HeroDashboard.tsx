'use client';

import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { useMultipleAttentionScores } from '@/hooks/useAttentionScore';
import { usePolling } from '@/hooks/usePolling';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface TokenCardProps {
  token: string;
  score: bigint;
  timestamp: bigint;
  isFresh: boolean;
  lastUpdated: bigint;
  chain: 'Sepolia' | 'Fuji';
  isLoading?: boolean;
  isComingSoon?: boolean;
}

function TokenCard({ token, score, timestamp, isFresh, lastUpdated, chain, isLoading, isComingSoon }: TokenCardProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  
  useEffect(() => {
    const updateTimeAgo = () => {
      if (lastUpdated > 0) {
        const now = Math.floor(Date.now() / 1000);
        const secondsAgo = now - Number(lastUpdated);
        
        if (secondsAgo < 60) {
          setTimeAgo(`${secondsAgo}s ago`);
        } else if (secondsAgo < 3600) {
          setTimeAgo(`${Math.floor(secondsAgo / 60)}m ago`);
        } else {
          setTimeAgo(`${Math.floor(secondsAgo / 3600)}h ago`);
        }
      } else {
        setTimeAgo('Never');
      }
    };
    
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const formatScore = (score: bigint) => {
    const num = Number(score);
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
        isComingSoon ? 'opacity-60' : ''
      }`}
    >
      {/* Chain Badge */}
      <div className="absolute top-3 right-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          chain === 'Sepolia' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {chain}
        </span>
      </div>

      {/* Coming Soon Badge */}
      {isComingSoon && (
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Coming Soon
          </span>
        </div>
      )}

      {/* Token Symbol */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        ${token}
      </h3>

      {/* Score Display */}
      <div className="mb-4">
        {isComingSoon ? (
          <div>
            <div className="text-3xl font-extrabold text-gray-400 dark:text-gray-600">
              ---
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Oracle Coming Soon
            </div>
          </div>
        ) : isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-16"></div>
          </div>
        ) : (
          <>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {formatScore(score)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Attention Score
            </div>
          </>
        )}
      </div>

      {/* Status Indicators */}
      {!isComingSoon && (
        <div className="space-y-2">
          {/* Freshness Status */}
          <div className="flex items-center gap-2">
            {isFresh ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
            )}
            <span className={`text-sm font-medium ${
              isFresh ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {isFresh ? 'Live Data' : 'Updating...'}
            </span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-4 w-4" />
            <span className="text-sm">{timeAgo}</span>
          </div>
        </div>
      )}

      {/* Pulse Animation for Live Data */}
      {isFresh && !isComingSoon && (
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl opacity-20"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
}

export default function HeroDashboard() {
  const chainId = useChainId();
  const [isClient, setIsClient] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [startTime] = useState(Date.now());

  // Load client-side only to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Active tokens with oracle data
  const activeTokens = ['BTC', 'ETH', 'PEPE', 'DOGE'];
  
  // Coming soon tokens (none for now - we have all 4!)
  const comingSoonTokens: string[] = [];

  // Get scores from both chains for active tokens only
  const sepoliaScores = useMultipleAttentionScores(activeTokens, 11155111);
  const fujiScores = useMultipleAttentionScores(activeTokens, 43113);

  // Set up polling to refresh data every 5 seconds
  usePolling(
    async () => {
      await Promise.all([
        sepoliaScores.refetch(),
        fujiScores.refetch()
      ]);
      setRefreshCount(prev => prev + 1);
    },
    { interval: 5000, enabled: true }
  );

  // Calculate uptime
  const uptimeMinutes = Math.floor((Date.now() - startTime) / 60000);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const remainingMinutes = uptimeMinutes % 60;

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <div className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 mb-4">
              Attention Futures
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Trade derivatives based on real-time social media attention scores powered by Chainlink oracles
            </p>
            
            {/* Live Stats */}
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 text-green-500" />
                <span>{refreshCount} data refreshes</span>
              </div>
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="h-4 w-4 text-blue-500" />
                <span>2 chains synchronized</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-purple-500" />
                <span>
                  {uptimeHours > 0 ? `${uptimeHours}h ${remainingMinutes}m` : `${remainingMinutes}m`} uptime
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Live Scores Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🔴 Live Cross-Chain Oracle Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Social media attention scores synchronized across Ethereum Sepolia and Avalanche Fuji via CCIP
          </p>

          {/* Active Tokens - Sepolia Scores */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Ethereum Sepolia (Source) - Active Oracles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTokens.map((token) => {
                const scoreData = sepoliaScores.data[token];
                return (
                  <TokenCard
                    key={`sepolia-${token}`}
                    token={token}
                    score={scoreData?.score || BigInt(0)}
                    timestamp={scoreData?.timestamp || BigInt(0)}
                    isFresh={scoreData?.isFresh || false}
                    lastUpdated={scoreData?.lastUpdated || BigInt(0)}
                    chain="Sepolia"
                    isLoading={sepoliaScores.isLoading}
                  />
                );
              })}
              
              {/* Coming Soon Tokens */}
              {comingSoonTokens.map((token) => (
                <TokenCard
                  key={`sepolia-soon-${token}`}
                  token={token}
                  score={BigInt(0)}
                  timestamp={BigInt(0)}
                  isFresh={false}
                  lastUpdated={BigInt(0)}
                  chain="Sepolia"
                  isComingSoon={true}
                />
              ))}
            </div>
          </div>

          {/* Active Tokens - Fuji Scores */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Avalanche Fuji (CCIP Destination) - Active Oracles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTokens.map((token) => {
                const scoreData = fujiScores.data[token];
                return (
                  <TokenCard
                    key={`fuji-${token}`}
                    token={token}
                    score={scoreData?.score || BigInt(0)}
                    timestamp={scoreData?.timestamp || BigInt(0)}
                    isFresh={scoreData?.isFresh || false}
                    lastUpdated={scoreData?.lastUpdated || BigInt(0)}
                    chain="Fuji"
                    isLoading={fujiScores.isLoading}
                  />
                );
              })}
              
              {/* Coming Soon Tokens */}
              {comingSoonTokens.map((token) => (
                <TokenCard
                  key={`fuji-soon-${token}`}
                  token={token}
                  score={BigInt(0)}
                  timestamp={BigInt(0)}
                  isFresh={false}
                  lastUpdated={BigInt(0)}
                  chain="Fuji"
                  isComingSoon={true}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-gray-200 dark:border-zinc-700">
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Oracle Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time attention scores for BTC, ETH, PEPE, DOGE via Chainlink Functions
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-gray-200 dark:border-zinc-700">
            <ArrowTrendingDownIcon className="h-8 w-8 text-blue-500 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cross-Chain Sync</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              CCIP bridges all token scores between Ethereum and Avalanche seamlessly
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-gray-200 dark:border-zinc-700">
            <CheckCircleIcon className="h-8 w-8 text-purple-500 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Automated Updates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chainlink Automation ensures fresh data every 2.5 minutes for all tokens
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow border border-gray-200 dark:border-zinc-700">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Circuit Breaker</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trading paused when oracle data becomes stale for safety
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 