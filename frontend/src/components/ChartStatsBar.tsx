'use client'

import { useFundingCountdown } from '@/hooks/useFundingCountdown'
import { useOpenInterest } from '@/hooks/useOpenInterest'

interface Props { token: string }

export default function ChartStatsBar({ token }: Props) {
  const seconds = useFundingCountdown()
  const { long, short, total } = useOpenInterest(token)

  const fmt = (s:number)=> String(Math.floor(s)).padStart(2,'0')
  const hrs = Math.floor(seconds/3600)
  const mins = Math.floor((seconds%3600)/60)
  const secs = seconds%60

  const pctLong = total>0? (long/total)*100:0

  return (
    <div className="flex items-center justify-between gap-6 text-xs md:text-sm bg-axBlack/80 border-b border-white/10 px-4 py-2">
      <div>
        Funding in: <span className={seconds<300?'text-red-400':'text-white'}>{fmt(hrs)}:{fmt(mins)}:{fmt(secs)}</span>
      </div>
      <div className="flex items-center gap-2 w-48 h-3 bg-white/10 rounded overflow-hidden">
        <div style={{width:`${pctLong}%`}} className="bg-green-500 h-full" />
        <div style={{width:`${100-pctLong}%`}} className="bg-red-500 h-full" />
      </div>
      <div className="hidden md:block">
        Long: {long.toFixed(2)} ETH | Short: {short.toFixed(2)} ETH
      </div>
    </div>
  )
} 