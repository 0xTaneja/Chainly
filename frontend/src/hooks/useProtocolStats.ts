import { useMultipleAttentionScores } from '@/hooks/useAttentionScore'
import { useAllPositions } from '@/hooks/usePositions'
import { useChainId, useContractRead } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionFuturesAbi } from '@/lib/abi/attentionFutures'

export interface ProtocolStats {
  scores: ReturnType<typeof useMultipleAttentionScores>['data']
  totalOpenInterest: number
  fees: number
  loading: boolean
}

export function useProtocolStats(tokens: string[] = ['BTC', 'ETH', 'PEPE', 'DOGE', 'LINK']): ProtocolStats {
  const chainId = useChainId() || 11155111

  const { data: scoresData, isLoading: loadingScores } = useMultipleAttentionScores(tokens, chainId)
  const { data: positionsData, isLoading: loadingPositions } = useAllPositions(chainId, 200)

  const futuresAddress = ADDRESSES[chainId]?.futures

  const { data: feesData, isLoading: loadingFees } = useContractRead({
    address: futuresAddress as `0x${string}` | undefined,
    abi: [
      {
        inputs: [],
        name: 'protocolFees',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    functionName: 'protocolFees',
    watch: true,
    enabled: Boolean(futuresAddress),
  })

  // Calculate open interest (sum of collateral * leverage for active positions)
  const totalOpenInterest = (positionsData as any[] | undefined)?.reduce?.((sum: number, p: any) => {
    if (!p.isActive) return sum
    const collateralEth = Number(p.collateral) / 1e18
    return sum + collateralEth * Number(p.leverage)
  }, 0) || 0

  const feesEth = Number(feesData || 0) / 1e18

  return {
    scores: scoresData || {},
    totalOpenInterest,
    fees: feesEth,
    loading: loadingScores || loadingPositions || loadingFees,
  }
} 