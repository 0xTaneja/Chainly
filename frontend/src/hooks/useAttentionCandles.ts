import { useEffect, useState, useMemo } from 'react'
import { useChainId, usePublicClient, useContractEvent } from 'wagmi'
import { decodeEventLog } from 'viem'
import { ADDRESSES } from '@/lib/addresses'
import { attentionOracleAbi } from '@/lib/abi/attentionOracle'
import { parseAbiItem } from 'viem'

export interface Candle {
  time: number // seconds unix (TradingView format)
  open: number
  high: number
  low: number
  close: number
}

export function useAttentionCandles(token: string, lookbackMinutes: number = 120) {
  const chainId = useChainId()
  const oracle = chainId ? (ADDRESSES[chainId]?.oracle as `0x${string}` | undefined) : undefined
  const publicClient = usePublicClient({ chainId })

  const [candles, setCandles] = useState<Candle[]>([])

  // ───────────────── Fetch historical events once ─────────────────
  useEffect(() => {
    if (!oracle || !token) return

    const fetchLogs = async () => {
      const toBlock = await publicClient.getBlockNumber()
      const fromBlock = toBlock - BigInt(6500) // ~1 day on Sepolia/fuji; adjust if needed
      const logs = await publicClient.getLogs({
        address: oracle,
        event: parseAbiItem('event AttentionUpdated(string token,uint256 score,uint256 timestamp)'),
        args: { token },
        fromBlock,
        toBlock,
      })

      const raw = logs.map((log) => {
        const { score, timestamp } = log.args as any
        return { score: Number(score) / 1e18, ts: Number(timestamp) }
      })
      buildCandles(raw)
    }

    const buildCandles = (ticks: { score: number; ts: number }[]) => {
      // group by minute
      const bucketMap = new Map<number, Candle>()
      for (const t of ticks) {
        const bucket = Math.floor(t.ts / 60) * 60 // start of minute
        const existing = bucketMap.get(bucket)
        if (!existing) {
          bucketMap.set(bucket, {
            time: bucket,
            open: t.score,
            high: t.score,
            low: t.score,
            close: t.score,
          })
        } else {
          existing.high = Math.max(existing.high, t.score)
          existing.low = Math.min(existing.low, t.score)
          existing.close = t.score
        }
      }
      const arr = Array.from(bucketMap.values()).sort((a, b) => a.time - b.time)
      const tail = arr.slice(-lookbackMinutes)
      setCandles(tail)
    }

    fetchLogs()
  }, [oracle, token, lookbackMinutes, publicClient])

  // ───────────────── Live updates ─────────────────
  useContractEvent({
    address: oracle,
    abi: attentionOracleAbi,
    eventName: 'AttentionUpdated',
    listener: (logsRaw) => {
      logsRaw.forEach((log: any) => {
        let decoded
        try {
          decoded = decodeEventLog({ abi: attentionOracleAbi, data: log.data, topics: log.topics })
        } catch {
          return
        }
        const { token: evtToken, score: scoreBig, timestamp: tsBig } = decoded.args as any
        if (evtToken !== token) return
        if (!scoreBig || !tsBig) return
        const score = Number(scoreBig) / 1e18
        const ts = Number(tsBig)
        setCandles((prev) => {
          const bucket = Math.floor(ts / 60) * 60
          const last = prev[prev.length - 1]
          let updated = [...prev]
          if (last && last.time === bucket) {
            // update existing candle
            last.high = Math.max(last.high, score)
            last.low = Math.min(last.low, score)
            last.close = score
            updated[updated.length - 1] = { ...last }
          } else {
            // push new candle
            updated.push({
              time: bucket,
              open: last ? last.close : score,
              high: score,
              low: score,
              close: score,
            })
          }
          return updated.slice(-lookbackMinutes)
        })
      })
    },
  })

  return useMemo(() => candles, [candles])
} 