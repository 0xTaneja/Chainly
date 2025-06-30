'use client'

import { useProtocolStats } from '@/hooks/useProtocolStats'

export default function StatsHeader() {
  const { scores, totalOpenInterest, fees, loading } = useProtocolStats()

  if (loading) {
    return (
      <div className="flex gap-4 mb-4 w-full px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-6 w-28 bg-gray-700 rounded" />
        ))}
      </div>
    )
  }

  const freshnessElems = Object.entries(scores || {}).map(([token, s]) => {
    const secondsAgo = Math.max(0, Math.floor(Date.now() / 1000 - Number(s.timestamp)))
    return (
      <div key={token} className="text-xs flex items-center gap-1">
        <span className="font-semibold">{token}</span>
        <span className={s.isFresh ? 'text-green-400' : 'text-red-400'}>
          {s.isFresh ? 'fresh' : 'stale'} {secondsAgo}s
        </span>
      </div>
    )
  })

  return (
    <div className="flex flex-wrap items-center gap-6 bg-axCard/60 border border-white/10 rounded-lg px-4 py-2 mb-4">
      {freshnessElems}
      <div className="ml-auto flex items-center gap-4 text-xs">
        <div>
          <span className="font-semibold">Open Interest:</span> {totalOpenInterest.toFixed(3)} ETH
        </div>
        <div>
          <span className="font-semibold">Fees:</span> {fees.toFixed(4)} ETH
        </div>
      </div>
    </div>
  )
} 