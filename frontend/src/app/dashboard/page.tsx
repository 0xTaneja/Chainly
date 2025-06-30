'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useNetwork } from 'wagmi'
import { useRouter } from 'next/navigation'
import { usePositions } from '@/hooks/usePositions'
import { useBridgeSync } from '@/hooks/useBridgeStatus'
import { useMultipleAttentionScores } from '@/hooks/useAttentionScore'
import TokenScoreCard from '@/components/dashboard/TokenScoreCard'
import ChainStatusIndicator from '@/components/dashboard/ChainStatusIndicator'
import SyncButton from '@/components/dashboard/SyncButton'
import LiveChart from '@/components/dashboard/LiveChart'
import PositionsList from '@/components/PositionsList'

const SUPPORTED_TOKENS = ['BTC', 'ETH', 'PEPE', 'DOGE']

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const [selectedToken, setSelectedToken] = useState('BTC')
  const router = useRouter()
  
  // Hooks for data fetching
  const { data: positions, isLoading: positionsLoading, refetch: refetchPositions } = usePositions(chain?.id || 11155111)
  const { isSynced, isLoading: bridgeLoading, refetch: refetchBridge } = useBridgeSync()
  const { data: tokenScores, isLoading: scoresLoading, refetch: refetchScores } = useMultipleAttentionScores(
    SUPPORTED_TOKENS, 
    chain?.id || 11155111
  )

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchPositions(),
      refetchBridge(),
      refetchScores()
    ])
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-axBlack flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400">Please connect your wallet to access the dashboard</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-axBlack text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-axBlack/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                onClick={() => router.push('/')}
                className="text-axMint hover:text-white transition-colors font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back to Axiom
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
                <p className="text-gray-400">Monitor your positions and market data</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ChainStatusIndicator chainId={chain?.id || 11155111} />
              <SyncButton 
                onRefresh={handleRefreshAll}
                isLoading={positionsLoading || bridgeLoading || scoresLoading}
                isSynced={isSynced}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-axOverlay/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Open Positions</h3>
            <p className="text-3xl font-bold text-white">
              {positions?.openPositionsCount || 0}
            </p>
          </div>
          <div className="bg-axOverlay/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Collateral</h3>
            <p className="text-3xl font-bold text-white">
              {positions?.totalCollateral ? 
                `${Number(positions.totalCollateral) / 1e18} ETH` : 
                '0 ETH'
              }
            </p>
          </div>
          <div className="bg-axOverlay/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Bridge Status</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSynced ? 'bg-axMint' : 'bg-red-500'}`} />
              <span className="text-white font-medium">
                {isSynced ? 'Synced' : 'Not Synced'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Token Scores Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Token Attention Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUPPORTED_TOKENS.map((token) => (
              <TokenScoreCard
                key={token}
                token={token}
                score={tokenScores?.[token]}
                isSelected={selectedToken === token}
                onClick={() => setSelectedToken(token)}
                chainId={chain?.id || 11155111}
              />
            ))}
          </div>
        </motion.div>

        {/* Chart and Positions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-axOverlay/30 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedToken} Attention Score
            </h3>
            <LiveChart 
              token={selectedToken}
              chainId={chain?.id || 11155111}
            />
          </motion.div>

          {/* Positions List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-axOverlay/30 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Your Positions</h3>
            <PositionsList />
          </motion.div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="py-8 text-center border-t border-white/10 mt-16">
        <p className="text-gray-400 text-sm">
          Made with <span className="text-axMint">❤️</span> by <span className="text-white font-semibold">Dev Rush</span>
        </p>
      </footer>
    </div>
  )
} 