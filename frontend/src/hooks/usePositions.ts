import { useContractRead, useAccount, useContractReads } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionFuturesAbi } from '@/lib/abi/attentionFutures'
import { attentionOracleAbi } from '@/lib/abi/attentionOracle'
import { usePublicClient } from 'wagmi'
import { useEffect, useState } from 'react'
import { parseAbiItem, decodeEventLog } from 'viem'

export interface Position {
  id: bigint
  trader: string
  token: string
  isLong: boolean
  collateral: bigint
  leverage: bigint
  openScore: bigint
  openTime: bigint
  isActive: boolean
  equity?: bigint
  healthFactor?: bigint
  pnl?: bigint
  realizedPnl?: bigint
  currentScore?: bigint
}

export interface PositionsData {
  positions: Position[]
  totalCollateral: bigint
  openPositionsCount: number
  error?: string
}

export function usePositions(chainId: number) {
  const { address } = useAccount()
  const futuresAddress = ADDRESSES[chainId]?.futures
  const publicClient = usePublicClient()
  const [realizedPnLs, setRealizedPnLs] = useState<Record<string, bigint>>({})

  // Get the next position ID to know the range to scan
  const { data: nextId, refetch: refetchNextId } = useContractRead({
    address: futuresAddress as `0x${string}`,
    abi: attentionFuturesAbi,
    functionName: 'nextId',
    enabled: !!futuresAddress,
  })

  // Fetch PositionClosed events for realized PnL (fixed block range)
  useEffect(() => {
    const fetchClosedEvents = async () => {
      if (!publicClient || !futuresAddress || !address) return
      
      try {
        // Get current block number and fetch only recent events (last 5,000 blocks)
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock > BigInt(5000) ? currentBlock - BigInt(5000) : BigInt(0)
        
        const rawLogs = await publicClient.getLogs({
          address: futuresAddress as `0x${string}`,
          fromBlock,
          toBlock: 'latest'
        }) as any[]

        const positionClosedAbi = "event PositionClosed(uint256 id,int256 pnl)"
        const abiItem = parseAbiItem(positionClosedAbi)

        const pnlMap: Record<string, bigint> = {}

        rawLogs.forEach((log) => {
          try {
            const decoded = decodeEventLog({ abi: [abiItem], data: log.data, topics: log.topics })
            if (decoded?.args) {
              const { id, pnl } = decoded.args as any
              pnlMap[id.toString()] = BigInt.asIntN(256, pnl as bigint)
            }
          } catch (_) {
            // ignore non-matching logs
          }
        })
        
        console.log(`📊 Fetched ${Object.keys(pnlMap).length} PositionClosed events from block ${fromBlock} to latest`)
        setRealizedPnLs(pnlMap)
      } catch (error) {
        console.error('Error fetching PositionClosed events:', error)
      }
    }

    fetchClosedEvents()
  }, [publicClient, futuresAddress, address])

  // If user has no wallet connected, return empty (no fallbacks)
  if (!address) {
    return {
      data: {
        positions: [],
        totalCollateral: BigInt(0),
        openPositionsCount: 0
      },
      isLoading: false,
      error: undefined,
      refetch: async () => {
        await refetchNextId()
      }
    }
  }

  // Prefer exact list of ids for user
  const { data: idArrayRes } = useContractRead({
    address: futuresAddress as `0x${string}`,
    abi: attentionFuturesAbi,
    functionName: 'userPositionIds',
    args: [address!],
    enabled: !!address && !!futuresAddress,
    watch: true,
  })

  const fallbackIds: bigint[] = (() => {
    const max = nextId ? Math.min(Number(nextId) - 1, 200) : 10
    return max > 0 ? Array.from({ length: max }, (_, i) => BigInt(i + 1)) : []
  })()

  const positionIds: bigint[] = (idArrayRes as bigint[] | undefined)?.length ? (idArrayRes as bigint[]) : fallbackIds

  // Create contracts array to check all positions
  const positionContracts = positionIds.flatMap(id => [
    {
      address: futuresAddress as `0x${string}`,
      abi: attentionFuturesAbi,
      functionName: 'positions',
      args: [id],
    },
    {
      address: futuresAddress as `0x${string}`,
      abi: attentionFuturesAbi,
      functionName: 'equity',
      args: [id],
    },
    {
      address: futuresAddress as `0x${string}`,
      abi: attentionFuturesAbi,
      functionName: 'healthFactor',
      args: [id],
    },
    {
      address: futuresAddress as `0x${string}`,
      abi: attentionFuturesAbi,
      functionName: 'calcPnl',
      args: [id],
    }
  ])

  const { data: positionsData, isLoading, error, refetch } = useContractReads({
    contracts: positionContracts,
    enabled: !!address && !!futuresAddress && positionIds.length > 0,
    cacheTime: 5000,
    staleTime: 2000,
    watch: true,
  })

  // Parse positions data and filter for current user
  const positions: Position[] = []
  let totalCollateral = BigInt(0)
  let openPositionsCount = 0

  if (positionsData && positionIds.length > 0) {
    for (let i = 0; i < positionIds.length; i++) {
      const baseIndex = i * 4
      const positionResult = positionsData[baseIndex]
      const equityResult = positionsData[baseIndex + 1]
      const healthFactorResult = positionsData[baseIndex + 2]
      const pnlResult = positionsData[baseIndex + 3]

      // Check for successful results
      if (positionResult?.status === 'success' && positionResult.result) {
        const positionData = positionResult.result as readonly [string, string, boolean, bigint, bigint, bigint, bigint, boolean]
        
        // Only include positions that belong to the current user and are not zero address
        if (positionData[0] !== '0x0000000000000000000000000000000000000000' && 
            positionData[0].toLowerCase() === address?.toLowerCase()) {
          const position: Position = {
            id: positionIds[i],
            trader: positionData[0],
            token: positionData[1],
            isLong: positionData[2],
            collateral: positionData[3],
            leverage: positionData[4],
            openScore: positionData[5],
            openTime: positionData[6],
            isActive: positionData[7],
            equity: (equityResult?.status === 'success' ? equityResult.result as bigint : BigInt(0)),
            healthFactor: (healthFactorResult?.status === 'success' ? healthFactorResult.result as bigint : BigInt(0)),
            pnl: (pnlResult?.status === 'success' ? 
              BigInt.asIntN(256, pnlResult.result as bigint) : BigInt(0)),
            realizedPnl: !positionData[7] ? realizedPnLs[positionIds[i].toString()] : undefined
          }

          positions.push(position)
          
          if (position.isActive) {
            openPositionsCount++
            totalCollateral += position.collateral
          }
        }
      }
    }
  }

  const result: PositionsData = {
    positions,
    totalCollateral,
    openPositionsCount,
    error: error?.message
  }

  return {
    data: result,
    isLoading,
    error: error?.message,
    refetch: async () => {
      await refetch()
      await refetchNextId()
      
      // Also refetch realized PnL events with proper block range
      if (publicClient && futuresAddress && address) {
        try {
          const currentBlock = await publicClient.getBlockNumber()
          const fromBlock = currentBlock > BigInt(5000) ? currentBlock - BigInt(5000) : BigInt(0)
          
          const rawLogs = await publicClient.getLogs({
            address: futuresAddress as `0x${string}`,
            fromBlock,
            toBlock: 'latest'
          }) as any[]

          const positionClosedAbi = "event PositionClosed(uint256 id,int256 pnl)"
          const abiItem = parseAbiItem(positionClosedAbi)

          const pnlMap: Record<string, bigint> = {}

          rawLogs.forEach((log) => {
            try {
              const decoded = decodeEventLog({ abi: [abiItem], data: log.data, topics: log.topics })
              if (decoded?.args) {
                const { id, pnl } = decoded.args as any
                pnlMap[id.toString()] = BigInt.asIntN(256, pnl as bigint)
              }
            } catch (_) {
              // ignore non-matching logs
            }
          })
          
          setRealizedPnLs(pnlMap)
        } catch (error) {
          console.error('Error refetching PositionClosed events:', error)
        }
      }
    }
  }
}

// Hook for a specific position
export function usePosition(positionId: bigint, chainId: number) {
  const futuresAddress = ADDRESSES[chainId]?.futures
  const publicClient = usePublicClient()
  const [realizedPnl, setRealizedPnl] = useState<bigint | undefined>(undefined)

  const { data, isLoading, error, refetch } = useContractReads({
    contracts: [
      {
        address: futuresAddress as `0x${string}`,
        abi: attentionFuturesAbi,
        functionName: 'positions',
        args: [positionId],
      },
      {
        address: futuresAddress as `0x${string}`,
        abi: attentionFuturesAbi,
        functionName: 'equity',
        args: [positionId],
      },
      {
        address: futuresAddress as `0x${string}`,
        abi: attentionFuturesAbi,
        functionName: 'healthFactor',
        args: [positionId],
      },
      {
        address: futuresAddress as `0x${string}`,
        abi: attentionFuturesAbi,
        functionName: 'calcPnl',
        args: [positionId],
      }
    ],
    enabled: !!futuresAddress,
    cacheTime: 2000,
    staleTime: 1000,
  })

  // Fetch realized PnL for this specific position if closed (fixed block range)
  useEffect(() => {
    const fetchRealizedPnL = async () => {
      if (!publicClient || !futuresAddress) return
      
      try {
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock > BigInt(5000) ? currentBlock - BigInt(5000) : BigInt(0)
        
        const rawLogs = await publicClient.getLogs({
          address: futuresAddress as `0x${string}`,
          fromBlock,
          toBlock: 'latest'
        }) as any[]

        const positionClosedAbi = "event PositionClosed(uint256 id,int256 pnl)"
        const abiItem = parseAbiItem(positionClosedAbi)

        const pnlMap: Record<string, bigint> = {}

        rawLogs.forEach((log) => {
          try {
            const decoded = decodeEventLog({ abi: [abiItem], data: log.data, topics: log.topics })
            if (decoded?.args) {
              const { id, pnl } = decoded.args as any
              pnlMap[id.toString()] = BigInt.asIntN(256, pnl as bigint)
            }
          } catch (_) {
            // ignore non-matching logs
          }
        })
        
        if (pnlMap[positionId.toString()] !== undefined) {
          setRealizedPnl(pnlMap[positionId.toString()])
        }
      } catch (error) {
        console.error('Error fetching PositionClosed event for position:', positionId, error)
      }
    }

    fetchRealizedPnL()
  }, [publicClient, futuresAddress, positionId])

  let position: Position | null = null

  if (data && data[0]?.status === 'success') {
    const positionData = data[0].result as readonly [string, string, boolean, bigint, bigint, bigint, bigint, boolean]
    position = {
      id: positionId,
      trader: positionData[0],
      token: positionData[1],
      isLong: positionData[2],
      collateral: positionData[3],
      leverage: positionData[4],
      openScore: positionData[5],
      openTime: positionData[6],
      isActive: positionData[7],
      equity: (data[1]?.status === 'success' ? data[1].result as bigint : BigInt(0)),
      healthFactor: (data[2]?.status === 'success' ? data[2].result as bigint : BigInt(0)),
      pnl: (data[3]?.status === 'success' ? 
        BigInt.asIntN(256, data[3].result as bigint) : BigInt(0)),
      realizedPnl: !positionData[7] ? realizedPnl : undefined
    }
  }

  return {
    data: position,
    isLoading,
    error: error?.message,
    refetch
  }
}

// Helper hook to get all positions across all users (admin view)
export function useAllPositions(chainId: number, maxPositions: number = 100) {
  const futuresAddress = ADDRESSES[chainId]?.futures

  // Create contracts array to read positions 1 through maxPositions
  const positionContracts = Array.from({ length: maxPositions }, (_, i) => ({
    address: futuresAddress as `0x${string}`,
    abi: attentionFuturesAbi,
    functionName: 'positions',
    args: [BigInt(i + 1)], // Position IDs start from 1
  }))

  const { data, isLoading, error, refetch } = useContractReads({
    contracts: positionContracts,
    enabled: !!futuresAddress,
    cacheTime: 10000,
    staleTime: 5000,
  })

  const positions: Position[] = []

  if (data) {
    data.forEach((result, index) => {
      if (result?.status === 'success' && result.result) {
        const positionData = result.result as readonly [string, string, boolean, bigint, bigint, bigint, bigint, boolean]
        
        // Only include active positions with non-zero trader address
        if (positionData[7] && positionData[0] !== '0x0000000000000000000000000000000000000000') {
          positions.push({
            id: BigInt(index + 1),
            trader: positionData[0],
            token: positionData[1],
            isLong: positionData[2],
            collateral: positionData[3],
            leverage: positionData[4],
            openScore: positionData[5],
            openTime: positionData[6],
            isActive: positionData[7],
          })
        }
      }
    })
  }

  return {
    data: positions,
    isLoading,
    error: error?.message,
    refetch
  }
} 