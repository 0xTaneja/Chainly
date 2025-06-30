import { useContractReads } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionOracleAbi } from '@/lib/abi/attentionOracle'

export interface AttentionScore {
  score: bigint
  timestamp: bigint
  isFresh: boolean
  lastUpdated: bigint
  error?: string
}

export function useAttentionScore(token: string, chainId?: number) {
  const oracleAddress = chainId === 43113 
    ? ADDRESSES[43113]?.oracle 
    : ADDRESSES[11155111]?.oracle

  const { data, isLoading, error, refetch } = useContractReads({
    contracts: [
      {
        address: oracleAddress as `0x${string}`,
        abi: attentionOracleAbi,
        functionName: 'getAttentionScore',
        args: [token],
      },
      {
        address: oracleAddress as `0x${string}`,
        abi: attentionOracleAbi,
        functionName: 'isDataFresh',
        args: [token],
      },
      {
        address: oracleAddress as `0x${string}`,
        abi: attentionOracleAbi,
        functionName: 'lastUpdated',
        args: [token],
      }
    ],
    enabled: !!token && !!oracleAddress,
    cacheTime: 1000,
    staleTime: 0,
    watch: true,
  })

  const result: AttentionScore | null = data ? {
    score: (data[0]?.result as [bigint, bigint])?.[0] || BigInt(0),
    timestamp: (data[0]?.result as [bigint, bigint])?.[1] || BigInt(0),
    isFresh: (data[1]?.result as boolean) || false,
    lastUpdated: (data[2]?.result as bigint) || BigInt(0),
    error: data[0]?.error?.message || data[1]?.error?.message || data[2]?.error?.message
  } : null

  return {
    data: result,
    isLoading,
    error: error?.message,
    refetch
  }
}

// Hook for multiple tokens
export function useMultipleAttentionScores(tokens: string[], chainId?: number) {
  const oracleAddress = chainId === 43113 
    ? ADDRESSES[43113]?.oracle 
    : ADDRESSES[11155111]?.oracle

  const contracts = tokens.flatMap(token => [
    {
      address: oracleAddress as `0x${string}`,
      abi: attentionOracleAbi,
      functionName: 'getAttentionScore',
      args: [token],
    },
    {
      address: oracleAddress as `0x${string}`,
      abi: attentionOracleAbi,
      functionName: 'isDataFresh',
      args: [token],
    },
    {
      address: oracleAddress as `0x${string}`,
      abi: attentionOracleAbi,
      functionName: 'lastUpdated',
      args: [token],
    }
  ])

  const { data, isLoading, error, refetch } = useContractReads({
    contracts,
    enabled: tokens.length > 0 && !!oracleAddress,
    cacheTime: 1000,
    staleTime: 0,
    watch: true,
  })

  const results: Record<string, AttentionScore> = {}
  
  if (data) {
    tokens.forEach((token, index) => {
      const baseIndex = index * 3
      results[token] = {
        score: (data[baseIndex]?.result as [bigint, bigint])?.[0] || BigInt(0),
        timestamp: (data[baseIndex]?.result as [bigint, bigint])?.[1] || BigInt(0),
        isFresh: (data[baseIndex + 1]?.result as boolean) || false,
        lastUpdated: (data[baseIndex + 2]?.result as bigint) || BigInt(0),
        error: data[baseIndex]?.error?.message || data[baseIndex + 1]?.error?.message || data[baseIndex + 2]?.error?.message
      }
    })
  }

  return {
    data: results,
    isLoading,
    error: error?.message,
    refetch
  }
} 