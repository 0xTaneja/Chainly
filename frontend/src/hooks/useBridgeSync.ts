import { useBridgeStatus } from './useBridgeStatus'
import { useMultipleAttentionScores } from './useAttentionScore'

export interface BridgeSyncData {
  isSynced: boolean
  sepoliaScores: Record<string, any>
  fujiScores: Record<string, any>
  bridgeStatus: any
  syncDifference: Record<string, number>
  error?: string
}

export function useBridgeSync() {
  const { data: bridgeStatus, isLoading: bridgeLoading, error: bridgeError } = useBridgeStatus()
  
  // Get scores from both chains
  const { data: sepoliaScores, isLoading: sepoliaLoading, refetch: refetchSepolia } = useMultipleAttentionScores(
    ['BTC', 'ETH', 'PEPE', 'DOGE'], 
    11155111 // Sepolia
  )
  
  const { data: fujiScores, isLoading: fujiLoading, refetch: refetchFuji } = useMultipleAttentionScores(
    ['BTC', 'ETH', 'PEPE', 'DOGE'], 
    43113 // Fuji
  )

  // Calculate sync status
  const isSynced = (() => {
    if (!bridgeStatus?.isOperational) return false
    if (!sepoliaScores || !fujiScores) return false

    // Check if scores are reasonably close (within 10% or 5 minute timestamp difference)
    const tokens = ['BTC', 'ETH', 'PEPE', 'DOGE']
    let syncedTokens = 0

    for (const token of tokens) {
      const sepoliaData = sepoliaScores[token]
      const fujiData = fujiScores[token]

      if (!sepoliaData || !fujiData) continue

      // Check timestamp difference (should be within 5 minutes = 300 seconds)
      const timestampDiff = Math.abs(Number(sepoliaData.timestamp) - Number(fujiData.timestamp))
      if (timestampDiff <= 300) {
        syncedTokens++
      }
    }

    // Consider synced if at least 75% of tokens are synced
    return syncedTokens >= Math.ceil(tokens.length * 0.75)
  })()

  // Calculate sync differences for each token
  const syncDifference: Record<string, number> = {}
  if (sepoliaScores && fujiScores) {
    const tokens = ['BTC', 'ETH', 'PEPE', 'DOGE']
    for (const token of tokens) {
      const sepoliaData = sepoliaScores[token]
      const fujiData = fujiScores[token]

      if (sepoliaData && fujiData) {
        syncDifference[token] = Math.abs(Number(sepoliaData.timestamp) - Number(fujiData.timestamp))
      }
    }
  }

  const result: BridgeSyncData = {
    isSynced,
    sepoliaScores: sepoliaScores || {},
    fujiScores: fujiScores || {},
    bridgeStatus,
    syncDifference,
    error: bridgeError || (sepoliaScores && Object.values(sepoliaScores).some(s => s?.error)) ? 'Oracle data error' : undefined
  }

  const isLoading = bridgeLoading || sepoliaLoading || fujiLoading

  const refetch = async () => {
    await Promise.all([
      refetchSepolia(),
      refetchFuji()
    ])
  }

  return {
    ...result,
    isLoading,
    refetch
  }
} 