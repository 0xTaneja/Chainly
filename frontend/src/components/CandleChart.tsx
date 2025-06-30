'use client'

import React, { useEffect, useRef } from 'react'
import type { IChartApi, Time } from 'lightweight-charts'
import { useAttentionCandles } from '@/hooks/useAttentionCandles'

interface Props {
  token: string
}

export default function CandleChart({ token }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const candles = useAttentionCandles(token)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<any>(null)

  // init chart once
  useEffect(() => {
    if (!containerRef.current) return

    let chart: IChartApi | null = null

    import('lightweight-charts').then((mod) => {
      const createChartFn = (mod as any).createChart ?? (mod as any).default?.createChart
      const CrosshairMode = (mod as any).CrosshairMode ?? (mod as any).default?.CrosshairMode
      if (!createChartFn || !CrosshairMode) return
      chart = createChartFn(containerRef.current as HTMLElement, {
        layout: {
          // solid transparent background
          background: { color: 'rgba(0,0,0,0)' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.05)' },
          horzLines: { color: 'rgba(255,255,255,0.05)' },
        },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.1)' },
      })

      // @ts-ignore – function exists at runtime
      const series = (chart as any).addCandlestickSeries?.({
        upColor: '#4ade80',
        downColor: '#f87171',
        wickUpColor: '#4ade80',
        wickDownColor: '#f87171',
        borderVisible: false,
      })
      
      chartRef.current = chart
      seriesRef.current = series
    })

    return () => {
      if (chart) chart.remove()
    }
  }, [])

  // update on data
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return
    const formatted = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))
    seriesRef.current.setData(formatted)
    if (chartRef.current) chartRef.current.timeScale().fitContent()
  }, [candles])

  return <div ref={containerRef} className="w-full h-80" />
} 