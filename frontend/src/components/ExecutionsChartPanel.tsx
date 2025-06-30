import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts'
import { useAccount } from 'wagmi'
import { useFuturesEvents } from '@/hooks/useFuturesEvents'

interface Props {
  token: string
}

export default function ExecutionsChartPanel({ token }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)

  const { address } = useAccount()
  const { opens, closes } = useFuturesEvents()

  // Build map id=>token for open events (needed to filter closes by token)
  const idTokenMap = new Map<string, string>()
  opens.forEach((o) => {
    idTokenMap.set(o.id.toString(), o.token)
  })

  // Filter opens by token
  const tokenOpens = opens.filter((o) => o.token === token)

  // Filter closes matching token via id map
  const tokenCloses = closes.filter((c) => {
    const t = idTokenMap.get(c.id.toString())
    return t === token
  })

  const events = [
    ...tokenOpens.map((o) => ({ type: 'open' as const, time: o.timestamp || Math.floor(Date.now() / 1000), id: o.id, mine: address ? o.trader.toLowerCase() === address.toLowerCase() : false })),
    ...tokenCloses.map((c) => ({ type: 'close' as const, time: c.timestamp || Math.floor(Date.now() / 1000), id: c.id, mine: false })),
  ].sort((a, b) => a.time - b.time)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      height: 400,
      layout: { background: { color: '#0F0F1A' }, textColor: '#ffffff' },
      grid: { horzLines: { visible: false }, vertLines: { visible: false } },
      timeScale: { timeVisible: true, secondsVisible: true },
    })
    // new v5 API: addSeries with series type constant
    // @ts-ignore generics not yet lined up
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#7EE787',
      downColor: '#FF6666',
      wickUpColor: '#7EE787',
      wickDownColor: '#FF6666',
      borderVisible: false,
    })

    chartRef.current = chart
    seriesRef.current = series

    return () => {
      chart.remove()
    }
  }, [])

  // update markers whenever events mutate
  useEffect(() => {
    if (!seriesRef.current) return

    if (events.length > 0) {
      // ensure strictly ascending unique times
      let last = 0
      const data = events.map((e, idx) => {
        let t = e.time
        if (t <= last) t = last + 1 // bump 1-sec forward to keep ascending order
        last = t

        // fabricate candle body that alternates for visual variety
        const base = 1 + (idx % 2 === 0 ? 0.02 : -0.02)
        return {
          time: t as any,
          open: base,
          high: base + 0.05,
          low: base - 0.05,
          close: base + (e.type === 'open' ? 0.02 : -0.02),
        }
      })
      seriesRef.current.setData(data as any)
    }

    const markers = events.map((e) => ({
      time: e.time as any,
      position: e.type === 'open' ? 'aboveBar' : 'belowBar',
      color: e.mine ? (e.type === 'open' ? '#FFD700' : '#FF4500') : (e.type === 'open' ? '#C8FF00' : '#FF6666'),
      shape: e.type === 'open' ? 'arrowUp' : 'arrowDown',
      text: `${e.type} #${e.id}`,
    }))
    // use helper to apply markers in v5
    // @ts-ignore
    createSeriesMarkers(seriesRef.current, markers)

    chartRef.current?.timeScale().fitContent()
  }, [events])

  return (
    <div className="rounded-lg bg-axCard p-4 border border-gray-800 flex flex-col h-full">
      <h3 className="text-sm font-medium mb-3">Your Executions</h3>
      <div ref={containerRef} className="flex-1 min-h-0" />
      {events.length === 0 && <p className="text-xs text-gray-400 mt-2">No executions yet</p>}
    </div>
  )
} 