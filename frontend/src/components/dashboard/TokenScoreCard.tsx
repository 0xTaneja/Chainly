'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useOracleFreshness } from '@/hooks/useOracleFreshness'
import { AttentionScore } from '@/hooks/useAttentionScore'

interface TokenScoreCardProps {
  token: string
  score?: AttentionScore
  isSelected: boolean
  onClick: () => void
  chainId: number
}

export default function TokenScoreCard({ 
  token, 
  score, 
  isSelected, 
  onClick, 
  chainId 
}: TokenScoreCardProps) {
  const { data: freshness } = useOracleFreshness(token, chainId)
  
  const formatScore = (score: bigint) => {
    const num = Number(score)
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getScoreColor = (isFresh: boolean) => {
    if (!isFresh) return 'text-red-400'
    return 'text-axMint'
  }

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - Number(timestamp)
    
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative cursor-pointer p-6 rounded-xl border backdrop-blur-sm transition-all duration-200
        ${isSelected 
          ? 'bg-axMint/10 border-axMint shadow-lg shadow-axMint/20' 
          : 'bg-axOverlay/30 border-white/10 hover:border-white/20'
        }
      `}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-axMint rounded-full" />
      )}

      {/* Token Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-axMint/20 to-axViolet/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{token}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">{token}</h3>
            <p className="text-gray-400 text-xs">Attention Score</p>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="mb-4">
        {score ? (
          <>
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-2xl font-bold ${getScoreColor(score.isFresh)}`}>
                {formatScore(score.score)}
              </span>
              <span className="text-gray-400 text-sm">points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${score.isFresh ? 'bg-axMint' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-400">
                {score.isFresh ? 'Fresh' : 'Stale'} • {formatTimeAgo(score.timestamp)}
              </span>
            </div>
          </>
        ) : (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-700 rounded w-3/4" />
          </div>
        )}
      </div>

      {/* Freshness Indicator */}
      {freshness && (
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Data Age</span>
            <span className={`${freshness.isFresh ? 'text-axMint' : 'text-red-400'}`}>
              {Number(freshness.timeSinceUpdate)}s
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${
                freshness.isFresh ? 'bg-axMint' : 'bg-red-400'
              }`}
              style={{ 
                width: `${Math.min(100, (Number(freshness.timeSinceUpdate) / Number(freshness.maxAge)) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {score?.error && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
          Error: {score.error}
        </div>
      )}
    </motion.div>
  )
} 