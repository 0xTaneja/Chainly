'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useChainId, useContractWrite, useWaitForTransaction } from 'wagmi';
import { usePositions } from '@/hooks/usePositions';
import { useAttentionScore } from '@/hooks/useAttentionScore';
import { attentionFuturesAbi } from '@/lib/abi/attentionFutures';
import { ADDRESSES } from '@/lib/addresses';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatEther } from 'viem';

export default function PositionsList() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [closingPositionId, setClosingPositionId] = useState<bigint | null>(null);

  // Get real positions data
  const { data: positionsData, isLoading, error, refetch } = usePositions(chainId || 11155111);
  const futuresAddress = ADDRESSES[chainId || 11155111]?.futures;

  // Get current attention scores for comparison
  const { data: currentBTCScore } = useAttentionScore('BTC', chainId || 11155111);
  const { data: currentETHScore } = useAttentionScore('ETH', chainId || 11155111);
  const { data: currentPEPEScore } = useAttentionScore('PEPE', chainId || 11155111);
  const { data: currentDOGEScore } = useAttentionScore('DOGE', chainId || 11155111);

  const getCurrentScore = (token: string) => {
    switch(token) {
      case 'BTC': return currentBTCScore?.score || BigInt(0);
      case 'ETH': return currentETHScore?.score || BigInt(0);
      case 'PEPE': return currentPEPEScore?.score || BigInt(0);
      case 'DOGE': return currentDOGEScore?.score || BigInt(0);
      default: return BigInt(0);
    }
  };

  // Close position contract write
  const { 
    data: closeData, 
    error: closeError, 
    isLoading: isClosing, 
    write: closePosition 
  } = useContractWrite({
    address: futuresAddress as `0x${string}`,
    abi: attentionFuturesAbi,
    functionName: 'closePosition',
    mode: 'recklesslyUnprepared' as any,
  });

  const { isLoading: txLoading, isSuccess: txSuccess } = useWaitForTransaction({
    hash: closeData?.hash,
  });

  // Handle close position
  const handleClosePosition = async (positionId: bigint) => {
    if (!closePosition) {
      toast.error('Close position function not available');
      return;
    }

    try {
      setClosingPositionId(positionId);
      await closePosition({
        args: [positionId],
      });
      toast.success('Close position transaction sent');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to close position');
      setClosingPositionId(null);
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (txSuccess) {
      toast.success('Position closed successfully!');
      setClosingPositionId(null);
      refetch(); // Refresh positions data
    }
  }, [txSuccess, refetch]);

  // Handle close error
  useEffect(() => {
    if (closeError) {
      toast.error(closeError.message || 'Failed to close position');
      setClosingPositionId(null);
    }
  }, [closeError]);

  if (!address) {
    return (
      <div className="text-center py-8">
        <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Connect wallet to view positions</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700">
            <div className="flex justify-between mb-4">
              <div className="flex gap-4">
                <div className="h-6 w-16 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              </div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-zinc-700 rounded"></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">Error loading positions</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button 
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const positions = positionsData?.positions || [];
  const filteredPositions = positions.filter(position => {
    if (filter === 'ALL') return true;
    return position.isActive === (filter === 'OPEN');
  });

  const formatScore = (score: bigint) => {
    const num = Number(score);
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(timestamp);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  const formatCollateral = (collateral: bigint) => {
    return `${parseFloat(formatEther(collateral)).toFixed(4)} ETH`;
  };

  const calculatePnL = (position: any) => {
    // For closed positions, use the realized PnL from PositionClosed event
    if (!position.isActive && position.realizedPnl !== undefined) {
      const realizedPnlETH = Number(position.realizedPnl) / 1e18;
      const collateral = Number(position.collateral) / 1e18;
      const pnlPercentage = collateral > 0 ? (realizedPnlETH / collateral) * 100 : 0;
      
      console.log(`💰 Position #${position.id} Realized PnL:`, {
        token: position.token,
        isLong: position.isLong,
        realizedPnlWei: position.realizedPnl.toString(),
        realizedPnlETH: realizedPnlETH,
        collateral: collateral,
        realizedPnlPercentage: pnlPercentage.toFixed(2) + '%'
      });
      
      return { pnl: realizedPnlETH, pnlPercentage, isClosed: true, isRealized: true };
    }
    
    // For closed positions without realized PnL data - don't show anything
    if (!position.isActive) {
      return { pnl: 0, pnlPercentage: 0, isClosed: true, isRealized: false, noData: true };
    }
    
    // Use contract PnL; if tiny (<1e-8 ETH) fall back to manual calc from score diff
    if (position.pnl !== undefined) {
      let pnlETH = parseFloat(formatEther(position.pnl ?? BigInt(0)));
      
      const currentScore = getCurrentScore(position.token);
      const openScore = position.openScore;
      const scoreDiff = Number(currentScore) - Number(openScore);
      const scoreChangePercent = Number(openScore) > 0 ? (scoreDiff / Number(openScore)) * 100 : 0;
      
      const collateral = parseFloat(formatEther(position.collateral));

      // If contract PnL is zero but score moved, recalc manually
      if (Math.abs(pnlETH) < 1e-8 && currentScore !== openScore) {
        const size = collateral * Number(position.leverage);
        const pctMove = Number(openScore) > 0 ? scoreDiff / Number(openScore) : 0;
        pnlETH = position.isLong ? size * pctMove : -size * pctMove;
      }

      const pnlPercentage = collateral > 0 ? (pnlETH / collateral) * 100 : 0;
      
      return { pnl: pnlETH, pnlPercentage, isClosed: false, isRealized: false, noData: false };
    }
    
    // If no contract data available, don't show fallback
    return { pnl: 0, pnlPercentage: 0, isClosed: false, isRealized: false, noData: true };
  };

  return (
    <div className="max-w-6xl mx-auto w-full resize-y overflow-auto border border-white/10 rounded-lg p-2 bg-black/60">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Positions</h2>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
          {(['ALL', 'OPEN', 'CLOSED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredPositions.length === 0 ? (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No positions found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'ALL' ? 'Open your first position to get started!' : `No ${filter.toLowerCase()} positions.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPositions.map((position, index) => {
            const { pnl, pnlPercentage, isClosed, isRealized, noData } = calculatePnL(position);
            const isClosingThis = closingPositionId === position.id;
            
            return (
              <motion.div
                key={position.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Token */}
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      ${position.token}
                    </div>
                    
                    {/* Direction Badge */}
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      position.isLong
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {position.isLong ? (
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4" />
                      )}
                      {position.isLong ? 'LONG' : 'SHORT'} {Number(position.leverage)}x
                    </div>

                    {/* Status Badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      position.isActive
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {position.isActive ? 'OPEN' : 'CLOSED'}
                    </div>
                  </div>

                  {/* PnL */}
                  <div className="text-right">
                    {noData ? (
                      // No data available - show loading state
                      <div>
                        <div className="text-xl font-bold text-gray-400 dark:text-gray-500">
                          ---
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Loading P&L
                        </div>
                      </div>
                    ) : isClosed ? (
                      // Display actual realized PnL for closed positions
                      <div>
                        <div className={`text-xl font-bold ${
                          pnl >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {pnl >= 0 ? '+' : ''}{Math.abs(pnl) < 0.00000001 && pnl !== 0 ? '<0.00000001' : pnl.toFixed(8)} ETH
                        </div>
                        {/* Only show percentage if it's meaningful (not near zero) */}
                        {Math.abs(pnlPercentage) >= 0.01 && (
                          <div className={`text-sm ${
                            pnl >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {isRealized ? '💰 Realized P&L' : '❓ P&L Unknown'}
                        </div>
                      </div>
                    ) : (
                      // Normal PnL display for active positions
                      <div>
                        <div className={`text-xl font-bold ${
                          pnl >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {pnl >= 0 ? '+' : ''}{Math.abs(pnl) < 0.00000001 && pnl !== 0 ? '<0.00000001' : pnl.toFixed(8)} ETH
                        </div>
                        {/* Only show percentage if it's meaningful (not near zero) */}
                        {Math.abs(pnlPercentage) >= 0.01 && (
                          <div className={`text-sm ${
                            pnl >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                          </div>
                        )}
                        {/* Show explanation when PnL is near zero for active positions */}
                        {Math.abs(pnl) < 0.00001 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            💡 No score movement yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Position Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Collateral</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatCollateral(position.collateral)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Entry Score</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatScore(position.openScore)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Current Score</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatScore(getCurrentScore(position.token))}
                      {(() => {
                        const current = Number(getCurrentScore(position.token));
                        const entry = Number(position.openScore);
                        const change = entry > 0 ? ((current - entry) / entry * 100) : 0;
                        return change !== 0 ? (
                          <span className={`ml-1 text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({change > 0 ? '+' : ''}{change.toFixed(2)}%)
                          </span>
                        ) : (
                          <span className="ml-1 text-xs text-gray-500">(0%)</span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Health Factor</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {position.isActive && position.healthFactor ? 
                        `${(Number(position.healthFactor) / 1e18 * 100).toFixed(1)}%` : 
                        '---'
                      }
                    </div>
                  </div>
                </div>

                {/* Time and Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      Opened
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatTimeAgo(position.openTime)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Position Size</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {(
                        parseFloat(formatEther(position.collateral)) * Number(position.leverage)
                      ).toFixed(4)} ETH
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {position.isActive && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <button 
                      onClick={() => handleClosePosition(position.id)}
                      disabled={isClosingThis || isClosing || txLoading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isClosingThis || (isClosing && closingPositionId === position.id) || txLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Closing...
                        </>
                      ) : (
                        <>
                          <XMarkIcon className="h-4 w-4" />
                          Close Position
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Position ID for debugging */}
                <div className="mt-2 text-xs text-gray-400">
                  Position #{position.id.toString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
} 