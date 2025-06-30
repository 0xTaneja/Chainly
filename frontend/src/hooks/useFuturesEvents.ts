import { useEffect, useState, useMemo } from 'react'
import { useChainId, usePublicClient, useContractEvent } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionFuturesAbi } from '@/lib/abi/attentionFutures'
import { parseAbiItem, decodeEventLog } from 'viem'

export interface OpenOrder {
  id: bigint
  trader: string
  token: string
  isLong: boolean
  collateral: bigint
  leverage: bigint
  openScore: bigint
  timestamp: number
}

export interface ClosedTrade {
  id: bigint
  pnl: bigint
  timestamp: number
}

export function useFuturesEvents() {
  const chainId = useChainId()
  const futures = chainId ? (ADDRESSES[chainId]?.futures as `0x${string}` | undefined) : undefined
  const publicClient = usePublicClient({ chainId })

  // Persist events to localStorage so they survive page reloads / new tabs
  const storageKeyOpens = useMemo(() => `af-opens-${chainId}`, [chainId])
  const storageKeyCloses = useMemo(() => `af-closes-${chainId}`, [chainId])

  const [opens, setOpens] = useState<OpenOrder[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(storageKeyOpens)
      return raw ? (JSON.parse(raw) as OpenOrder[]) : []
    } catch {
      return []
    }
  })

  const [closes, setCloses] = useState<ClosedTrade[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(storageKeyCloses)
      return raw ? (JSON.parse(raw) as ClosedTrade[]) : []
    } catch {
      return []
    }
  })

  // initial fetch
  useEffect(() => {
    if (!futures) return
    const fetchLogs = async () => {
      const toBlock = await publicClient.getBlockNumber()
      // limit range to last 50,000 blocks to avoid RPC limits
      const RANGE = BigInt(50000)
      const fromBlock = toBlock > RANGE ? toBlock - RANGE : BigInt(0)
      const openedRaw = await publicClient.getLogs({ address: futures, fromBlock, toBlock }) as any[]
      const openAbi = parseAbiItem('event PositionOpened(uint256 indexed id,address indexed trader,string token,bool isLong,uint256 collateral,uint256 leverage,uint256 openScore)')
      const closedAbi = parseAbiItem('event PositionClosed(uint256 indexed id,int256 pnl)')

      const openedRawWithArgs: any[] = []
      const closedRawWithArgs: any[] = []

      openedRaw.forEach((log) => {
        try {
          const decoded = decodeEventLog({ abi: [openAbi], data: log.data, topics: log.topics })
          if (decoded?.eventName === 'PositionOpened') openedRawWithArgs.push({ ...log, args: decoded.args })
        } catch (_) {
          try {
            const decoded = decodeEventLog({ abi: [closedAbi], data: log.data, topics: log.topics })
            if (decoded?.eventName === 'PositionClosed') closedRawWithArgs.push({ ...log, args: decoded.args })
          } catch (_) {}
        }
      })

      // Collect unique block numbers to fetch timestamps in a single batch
      const blockNumbers = Array.from(
        new Set([
          ...openedRawWithArgs.map((l) => l.blockNumber as bigint),
          ...closedRawWithArgs.map((l) => l.blockNumber as bigint),
        ])
      )

      const blockTimestamps: Record<string, number> = {}
      await Promise.all(
        blockNumbers.map(async (bn) => {
          try {
            const block = await publicClient.getBlock({ blockNumber: bn })
            blockTimestamps[bn.toString()] = Number(block.timestamp)
          } catch (_) {}
        })
      )

      const parsedOpens: OpenOrder[] = openedRawWithArgs.map((log) => {
        const { id, trader, token, isLong, collateral, leverage, openScore } = log.args as any
        return {
          id,
          trader,
          token,
          isLong,
          collateral,
          leverage,
          openScore,
          timestamp: blockTimestamps[(log.blockNumber as bigint).toString()] || 0,
        }
      })
      const parsedCloses: ClosedTrade[] = closedRawWithArgs.map((log) => {
        const { id, pnl } = log.args as any
        return { id, pnl, timestamp: blockTimestamps[(log.blockNumber as bigint).toString()] || 0 }
      })

      setOpens(parsedOpens)
      setCloses(parsedCloses)
    }
    fetchLogs()
  }, [futures, publicClient])

  // live listeners
  useContractEvent({
    address: futures,
    abi: attentionFuturesAbi,
    eventName: 'PositionOpened',
    listener: async (logs: any[]) => {
      for (const log of logs) {
        const { args, blockNumber } = log
        if (!args) continue
        const { id, trader, token, isLong, collateral, leverage, openScore } = args as any
        try {
          const block = await publicClient.getBlock({ blockNumber })
          const ts = Number(block.timestamp)
          setOpens((prev) => {
            if (prev.some((o) => o.id === id)) return prev
            return [...prev, { id, trader, token, isLong, collateral, leverage, openScore, timestamp: ts }]
          })
        } catch (_) {}
      }
    },
  })

  useContractEvent({
    address: futures,
    abi: attentionFuturesAbi,
    eventName: 'PositionClosed',
    listener: async (logs: any[]) => {
      for (const log of logs) {
        const { args, blockNumber } = log
        if (!args) continue
        const { id, pnl } = args as any
        try {
          const block = await publicClient.getBlock({ blockNumber })
          const ts = Number(block.timestamp)
          setCloses((prev) => [...prev, { id, pnl, timestamp: ts }])
        } catch (_) {
          setCloses((prev) => [...prev, { id, pnl, timestamp: Date.now() / 1000 }])
        }
        // remove from open list
        setOpens((prev) => prev.filter((o) => o.id !== id))
      }
    },
  })

  // Persist to localStorage whenever lists change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKeyOpens, JSON.stringify(opens))
      window.localStorage.setItem(storageKeyCloses, JSON.stringify(closes))
    } catch (_) {
      // ignore quota errors, etc.
    }
  }, [opens, closes, storageKeyOpens, storageKeyCloses])

  return useMemo(() => ({ opens, closes }), [opens, closes])
} 