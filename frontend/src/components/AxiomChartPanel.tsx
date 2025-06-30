'use client'

import { useEffect, useRef } from 'react'
import { useAttentionScore } from '@/hooks/useAttentionScore'

interface Props {
  token: string // e.g. 'BTC'
}

export default function AxiomChartPanel({ token }: Props) {
  const tvRef = useRef<HTMLDivElement>(null)
  const { data } = useAttentionScore(token)
  const lastPrice = Number(data?.score || 0) / 1e18

  useEffect(() => {
    if (!tvRef.current) return
    tvRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      // @ts-ignore
      if (window.TradingView) {
        const symbolMap = {
          BTC: 'BINANCE:BTCUSDT',
          ETH: 'BINANCE:ETHUSDT',
          DOGE: 'BINANCE:DOGEUSDT',
          PEPE: 'GATE:PEPEUSDT',
          LINK: 'BINANCE:LINKUSDT',
        } as Record<string,string>

        // @ts-ignore
        new window.TradingView.widget({
          autosize: true,
          symbol: symbolMap[token] ?? 'BINANCE:BTCUSDT',
          interval: '60',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#121212',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          container_id: `tv_${token}`,
        })
      }
    }

    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [token])

  return (
    <div className="rounded-lg bg-axCard p-4 border border-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl font-bold">{token}</span>
        <span className="text-axGreenBright font-bold">{lastPrice.toFixed(3)}</span>
      </div>
      <div className="h-[400px] relative bg-axBlack rounded" aria-label="Price Chart">
        <div id={`tv_${token}`} ref={tvRef} className="w-full h-full" style={{ minHeight: 400 }} />
      </div>
    </div>
  )
} 