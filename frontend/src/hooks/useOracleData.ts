import { useContractReads, usePublicClient } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionOracleAbi } from '@/lib/abi/attentionOracle'
import { useEffect, useState } from 'react'

export interface OracleTokenData {
  token: string
  score: bigint
  timestamp: bigint
  isDataFresh: boolean
  lastUpdated: bigint
  chainId: number
  chainStatus: 'synced' | 'syncing' | 'error'
}

export interface CrossChainSyncStatus {
  sepoliaData: OracleTokenData[]
  fujiData: OracleTokenData[]
  isInSync: boolean
  lastSyncCheck: number
}

const SUPPORTED_TOKENS = ['BTC', 'ETH', 'PEPE', 'DOGE', 'LINK']

export function useOracleData() {
  const publicClient = usePublicClient()
  const [syncStatus, setSyncStatus] = useState<CrossChainSyncStatus>({
    sepoliaData: [],
    fujiData: [],
    isInSync: false,
    lastSyncCheck: Date.now()
  })

  // Sepolia Oracle Contracts
  const sepoliaOracleAddress = ADDRESSES[11155111]?.oracle
  const sepoliaContracts = SUPPORTED_TOKENS.flatMap(token => [
    {
      address: sepoliaOracleAddress as `0x${string}`,
      abi: attentionOracleAbi,
      functionName: 'getAttentionScore',
      args: [token],
      chainId: 11155111
    },
    {
      address: sepoliaOracleAddress as `0x${string}`,
      abi: attentionOracleAbi,
      functionName: 'isDataFresh',
      args: [token],
      chainId: 11155111
    },
    {
      address: sepoliaOracleAddress as `0x${string}`,
      abi: attentionOracleAbi,
      functionName: 'lastUpdated',
      args: [token],
      chainId: 11155111
    }
  ])

  // Fuji Oracle Contracts  
  const fujiOracleAddress = ADDRESSES[43113]?.oracle
  const fujiContracts = SUPPORTED_TOKENS.flatMap(token => [
    {
      address: fujiOracleAddress as `0x${string}`,
      abi: attentionOracleAbi,
      functionName: 'getAttentionScore',
      args: [token],
      chainId: 43113
    },
    {
      address: fujiOracleAddress as `0x${string}`,
      abi: attentionOracleAbi,
      functionName: 'isDataFresh',
      args: [token],
      chainId: 43113
    },
    {
      address: fujiOracleAddress as `0x${string}`,
      abi: attentionOracleAbi,
      functionName: 'lastUpdated',
      args: [token],
      chainId: 43113
    }
  ])

  // Fetch Sepolia Oracle Data
  const { data: sepoliaData, isLoading: sepoliaLoading, refetch: refetchSepolia } = useContractReads({
    contracts: sepoliaContracts,
    enabled: !!sepoliaOracleAddress,
    cacheTime: 2000,
    staleTime: 1000,
  })

  // Fetch Fuji Oracle Data
  const { data: fujiData, isLoading: fujiLoading, refetch: refetchFuji } = useContractReads({
    contracts: fujiContracts,
    enabled: !!fujiOracleAddress,
    cacheTime: 2000,
    staleTime: 1000,
  })

  // Process real oracle data
  const processOracleData = (data: any[], chainId: number): OracleTokenData[] => {
    const tokenData: OracleTokenData[] = []
    
    if (!data) return tokenData

    for (let i = 0; i < SUPPORTED_TOKENS.length; i++) {
      const baseIndex = i * 3
      const scoreResult = data[baseIndex]
      const freshResult = data[baseIndex + 1] 
      const updatedResult = data[baseIndex + 2]

      if (scoreResult?.status === 'success' && scoreResult.result) {
        const [scoreRaw, timestamp] = scoreResult.result as [bigint, bigint]
        const score = Number(scoreRaw > BigInt(1e9) ? Number(scoreRaw) / 1e18 : Number(scoreRaw))
        const isDataFresh = freshResult?.status === 'success' ? freshResult.result as boolean : false
        const lastUpdated = updatedResult?.status === 'success' ? updatedResult.result as bigint : BigInt(0)

        // Determine chain status based on data freshness and recency
        let chainStatus: 'synced' | 'syncing' | 'error' = 'error'
        if (isDataFresh && lastUpdated > 0) {
          const updateAge = BigInt(Math.floor(Date.now() / 1000)) - lastUpdated
          chainStatus = updateAge < BigInt(300) ? 'synced' : 'syncing' // 5 min threshold
        }

        tokenData.push({
          token: SUPPORTED_TOKENS[i],
          score: BigInt(scoreRaw),
          timestamp,
          isDataFresh,
          lastUpdated,
          chainId,
          chainStatus
        })
      }
    }

    return tokenData
  }

  // Listen for real AttentionUpdated events
  useEffect(() => {
    const fetchOracleEvents = async () => {
      if (!publicClient) return

      try {
        // Fetch recent AttentionUpdated events from both chains
        const sepoliaLogs = sepoliaOracleAddress ? await publicClient.getLogs({
          address: sepoliaOracleAddress as `0x${string}`,
          event: {
            type: 'event',
            name: 'AttentionUpdated',
            inputs: [
              { indexed: true, name: 'token', type: 'string' },
              { indexed: false, name: 'score', type: 'uint256' },
              { indexed: false, name: 'timestamp', type: 'uint256' }
            ]
          },
          fromBlock: 'latest',
          toBlock: 'latest'
        }) : []

        console.log(`🔗 Fetched ${sepoliaLogs.length} AttentionUpdated events from Sepolia`)

        if (sepoliaLogs.length > 0) {
          // Trigger refetch when new events detected
          refetchSepolia()
          refetchFuji()
        }
      } catch (error) {
        console.error('Error fetching oracle events:', error)
      }
    }

    // Poll for new events every 10 seconds
    const interval = setInterval(fetchOracleEvents, 10000)
    fetchOracleEvents() // Initial fetch

    return () => clearInterval(interval)
  }, [publicClient, sepoliaOracleAddress, refetchSepolia, refetchFuji])

  // Update sync status with real data
  useEffect(() => {
    if (sepoliaData && fujiData) {
      const sepoliaProcessed = processOracleData(sepoliaData, 11155111)
      const fujiProcessed = processOracleData(fujiData, 43113)

      // Check if chains are in sync by comparing scores
      const isInSync = sepoliaProcessed.every(sepoliaToken => {
        const fujiToken = fujiProcessed.find(f => f.token === sepoliaToken.token)
        if (!fujiToken) return false
        
        // Consider in sync if scores are within 5% or timestamps within 10 minutes
        const scoreDiff = sepoliaToken.score > fujiToken.score 
          ? sepoliaToken.score - fujiToken.score
          : fujiToken.score - sepoliaToken.score
        const scoreThreshold = sepoliaToken.score * BigInt(5) / BigInt(100) // 5%
        
        const timeDiff = sepoliaToken.timestamp > fujiToken.timestamp
          ? sepoliaToken.timestamp - fujiToken.timestamp  
          : fujiToken.timestamp - sepoliaToken.timestamp
        const timeThreshold = BigInt(600) // 10 minutes

        return scoreDiff <= scoreThreshold && timeDiff <= timeThreshold
      })

      setSyncStatus({
        sepoliaData: sepoliaProcessed,
        fujiData: fujiProcessed,
        isInSync,
        lastSyncCheck: Date.now()
      })
    }
  }, [sepoliaData, fujiData])

  return {
    oracleData: syncStatus,
    isLoading: sepoliaLoading || fujiLoading,
    refetch: async () => {
      await refetchSepolia()
      await refetchFuji()
    }
  }
} 