'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAttentionScore } from '@/hooks/useAttentionScore'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface LiveChartProps {
  token: string
  chainId: number
}

interface DataPoint {
  timestamp: number
  score: number
  isFresh: boolean
}

export default function LiveChart({ token, chainId }: LiveChartProps) {
  const { data: currentScore, isLoading } = useAttentionScore(token, chainId)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral')

  // Add new data point when score updates
  useEffect(() => {
    if (currentScore && currentScore.score) {
      const scoreNumber = Number(currentScore.score);
      const timestamp = Number(currentScore.timestamp);
      
      setDataPoints(prev => {
        // Prevent adding duplicate points (same score and timestamp)
        const lastPoint = prev[prev.length - 1];
        if (lastPoint && lastPoint.score === scoreNumber && 
            Math.abs(lastPoint.timestamp - Date.now()) < 30000) { // 30 second threshold
          return prev;
        }
        
        const newPoint: DataPoint = {
          timestamp: Date.now(),
          score: scoreNumber,
          isFresh: currentScore.isFresh
        }

        const updated = [...prev, newPoint].slice(-20) // Keep last 20 points
        
        // Calculate trend
        if (updated.length >= 2) {
          const current = updated[updated.length - 1].score
          const previous = updated[updated.length - 2].score
          if (current > previous) setTrend('up')
          else if (current < previous) setTrend('down')
          else setTrend('neutral')
        }
        
        return updated
      })
    }
  }, [currentScore?.score, currentScore?.timestamp, currentScore?.isFresh]) // Use specific dependencies

  const formatScore = (score: number) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`
    return score.toString()
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-axMint" />
      case 'down': return <TrendingDown className="w-5 h-5 text-red-400" />
      default: return <Minus className="w-5 h-5 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-axMint'
      case 'down': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-axMint border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const maxScore = Math.max(...dataPoints.map(p => p.score), 1)
  const minScore = Math.min(...dataPoints.map(p => p.score), 0)
  const scoreRange = maxScore - minScore || 1

  return (
    <div className="space-y-4">
      {/* Current Score Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold ${getTrendColor()}`}>
            {currentScore ? formatScore(Number(currentScore.score)) : '---'}
          </span>
          {getTrendIcon()}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${currentScore?.isFresh ? 'bg-axMint' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-400">
            {currentScore?.isFresh ? 'Live' : 'Stale'}
          </span>
        </div>
      </div>

      {/* Simple Line Chart */}
      <div className="relative h-40 bg-axBlack/30 rounded-lg p-4">
        {dataPoints.length >= 2 ? (
          <svg className="w-full h-full" viewBox="0 0 400 120">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7EE787" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#7EE787" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 30}
                x2="400"
                y2={i * 30}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            ))}

            {/* Data Line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              d={`M ${dataPoints.map((point, index) => {
                const x = (index / (dataPoints.length - 1)) * 400
                const y = 120 - ((point.score - minScore) / scoreRange) * 120
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
              }).join(' ')}`}
              fill="none"
              stroke="#7EE787"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Area Fill */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              d={`${dataPoints.map((point, index) => {
                const x = (index / (dataPoints.length - 1)) * 400
                const y = 120 - ((point.score - minScore) / scoreRange) * 120
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
              }).join(' ')} L 400 120 L 0 120 Z`}
              fill="url(#scoreGradient)"
            />

            {/* Data Points */}
            {dataPoints.map((point, index) => {
              const x = (index / (dataPoints.length - 1)) * 400
              const y = 120 - ((point.score - minScore) / scoreRange) * 120
              return (
                <motion.circle
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={point.isFresh ? "#7EE787" : "#EF4444"}
                  stroke="#0F0F1A"
                  strokeWidth="2"
                />
              )
            })}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Collecting data...
          </div>
        )}
      </div>

      {/* Stats */}
      {dataPoints.length > 0 && (
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <p className="text-gray-400 mb-1">High</p>
            <p className="text-white font-medium">{formatScore(maxScore)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-1">Low</p>
            <p className="text-white font-medium">{formatScore(minScore)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 mb-1">Points</p>
            <p className="text-white font-medium">{dataPoints.length}</p>
          </div>
        </div>
      )}
    </div>
  )
} 