'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useChainId, useContractRead } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionOracleAbi } from '@/lib/abi/attentionOracle'
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

interface TradingChartProps {
  token: string
}

interface ChartPoint {
  time: string
  timestamp: number
  score: number
}

export default function TradingChart({ token }: TradingChartProps) {
  const chainId = useChainId()
  const oracleAddress = chainId ? (ADDRESSES[chainId]?.oracle as `0x${string}` | undefined) : undefined

  // ───────────────── CONTRACT READ ─────────────────
  const {
    data: scoreData,
    refetch,
  } = useContractRead({
    address: oracleAddress,
    abi: attentionOracleAbi,
    functionName: 'getAttentionScore',
    args: [token],
    enabled: Boolean(oracleAddress && token),
    watch: true, // automatically refetch on new blocks
  })

  // ───────────────── CHART STATE ─────────────────
  const [points, setPoints] = useState<ChartPoint[]>([])

  // When new scoreData arrives, update dataset
  useEffect(() => {
    if (!scoreData) return

    const [scoreBig, tsBig] = scoreData as readonly [bigint, bigint]
    const score = Number(scoreBig) / 1e18
    const timestamp = Number(tsBig) * 1000 // ms

    // Avoid duplicates (same timestamp)
    setPoints((prev) => {
      if (prev.length && prev[prev.length - 1].timestamp === timestamp) return prev
      const newPoint: ChartPoint = {
        time: new Date(timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp,
        score,
      }
      const next = [...prev, newPoint]
      // Keep last 120 points (~20 mins if 10s interval)
      return next.slice(-120)
    })
  }, [scoreData])

  // Manual polling every 10s to ensure updates even if no new block
  useEffect(() => {
    const id = setInterval(() => {
      refetch()
    }, 10_000)
    return () => clearInterval(id)
  }, [refetch])

  const currentPoint = points[points.length - 1]
  const previousPoint = points[points.length - 2]
  const scoreChange = currentPoint && previousPoint ? currentPoint.score - previousPoint.score : 0

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#7EE787]" />
          <h3 className="text-lg font-semibold text-white">
            {token} Attention Score
          </h3>
        </div>
        {currentPoint && (
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">
              {currentPoint.score.toFixed(2)}
            </span>
            <span className={`flex items-center gap-1 font-medium ${scoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {scoreChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {scoreChange >= 0 ? '+' : ''}{scoreChange.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* CHART */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7EE787" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7EE787" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} labelStyle={{ color: '#9CA3AF' }} />
            <Area type="monotone" dataKey="score" stroke="#7EE787" strokeWidth={2} fill="url(#scoreGradient)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <div>Live data every ~block</div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Auto-refresh 10s
        </div>
      </div>
    </div>
  )
} 