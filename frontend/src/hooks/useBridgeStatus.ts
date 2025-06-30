import { useContractReads } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { scoreBridgeSenderAbi } from '@/lib/abi/scoreBridgeSender'
import { scoreBridgeReceiverAbi } from '@/lib/abi/scoreBridgeReceiver'

export interface BridgeStatus {
  senderAddress: string
  receiverAddress: string
  senderOracle: string
  receiverOracle: string
  isOperational: boolean
  error?: string
}

export function useBridgeStatus() {
  const senderAddress = ADDRESSES[11155111]?.sender // Sepolia sender
  const receiverAddress = ADDRESSES[43113]?.receiver // Fuji receiver

  const { data, isLoading, error, refetch } = useContractReads({
    contracts: [
      // Sender contract calls (Sepolia)
      {
        address: senderAddress as `0x${string}`,
        abi: scoreBridgeSenderAbi,
        functionName: 'oracle',
        chainId: 11155111,
      },
      {
        address: senderAddress as `0x${string}`,
        abi: scoreBridgeSenderAbi,
        functionName: 'destReceiver',
        chainId: 11155111,
      },
      // Receiver contract calls (Fuji)
      {
        address: receiverAddress as `0x${string}`,
        abi: scoreBridgeReceiverAbi,
        functionName: 'oracle',
        chainId: 43113,
      },
      {
        address: receiverAddress as `0x${string}`,
        abi: scoreBridgeReceiverAbi,
        functionName: 'allowedSender',
        chainId: 43113,
      },
    ],
    enabled: !!senderAddress && !!receiverAddress,
    cacheTime: 10000, // Cache for 10 seconds
    staleTime: 5000, // Consider stale after 5 seconds
  })

  const result: BridgeStatus | null = data ? {
    senderAddress: senderAddress || '',
    receiverAddress: receiverAddress || '',
    senderOracle: (data[0]?.result as string) || '',
    receiverOracle: (data[2]?.result as string) || '',
    isOperational: !!(data[0]?.result && data[2]?.result), // Both oracles should be set
    error: data[0]?.error?.message || data[1]?.error?.message || data[2]?.error?.message || data[3]?.error?.message
  } : null

  return {
    data: result,
    isLoading,
    error: error?.message,
    refetch
  }
}

// Hook to check if bridge is synced (simplified version)
export function useBridgeSync() {
  const { data: bridgeStatus, isLoading, error, refetch } = useBridgeStatus()
  
  // Simple check - if both oracles are configured, consider it synced
  const isSynced = bridgeStatus ? 
    !!bridgeStatus.senderOracle && 
    !!bridgeStatus.receiverOracle &&
    bridgeStatus.isOperational
    : false

  return {
    isSynced,
    senderOracle: bridgeStatus?.senderOracle || '',
    receiverOracle: bridgeStatus?.receiverOracle || '',
    isLoading,
    error,
    refetch
  }
} 