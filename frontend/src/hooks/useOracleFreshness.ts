import { useContractRead } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionOracleAbi } from '@/lib/abi/attentionOracle'

export interface OracleFreshnessData {
  isFresh: boolean
  lastUpdated: bigint
  maxAge: bigint
  timeSinceUpdate: bigint
  error?: string
}

export function useOracleFreshness(token: string, chainId: number) {
  const oracleAddress = ADDRESSES[chainId]?.oracle

  const { data: isFresh, isLoading: isFreshLoading, error: isFreshError } = useContractRead({
    address: oracleAddress as `0x${string}`,
    abi: attentionOracleAbi,
    functionName: 'isDataFresh',
    args: [token],
    enabled: !!token && !!oracleAddress,
    cacheTime: 0,
    staleTime: 0,
  })

  const { data: lastUpdated, isLoading: lastUpdatedLoading, error: lastUpdatedError } = useContractRead({
    address: oracleAddress as `0x${string}`,
    abi: attentionOracleAbi,
    functionName: 'lastUpdated',
    args: [token],
    enabled: !!token && !!oracleAddress,
    cacheTime: 0,
    staleTime: 0,
  })

  const currentTime = BigInt(Math.floor(Date.now() / 1000))
  const timeSinceUpdate = lastUpdated ? currentTime - lastUpdated : BigInt(0)
  const maxAge = BigInt(300) // 5 minutes hardcoded since maxAge function doesn't exist in ABI

  const result: OracleFreshnessData = {
    isFresh: isFresh || false,
    lastUpdated: lastUpdated || BigInt(0),
    maxAge,
    timeSinceUpdate,
    error: isFreshError?.message || lastUpdatedError?.message
  }

  return {
    data: result,
    isLoading: isFreshLoading || lastUpdatedLoading,
    error: isFreshError || lastUpdatedError,
    refetch: () => {
      // Trigger refetch for all queries
    }
  }
} 