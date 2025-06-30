import { useState } from 'react'
import { useAccount, useChainId, useContractWrite, useWaitForTransaction } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionFuturesAbi } from '@/lib/abi/attentionFutures'
import toast from 'react-hot-toast'
import OrderTicketUI from '@/components/OrderTicketUI'
import { useAttentionScore } from '@/hooks/useAttentionScore'

interface Props {
  token: string
  isLong: boolean
  onToggle: () => void
}

export default function OrderTicketContainer({ token, isLong, onToggle }: Props) {
  const { address } = useAccount()
  const chainId = useChainId()
  const futures = chainId ? (ADDRESSES[chainId]?.futures as `0x${string}` | undefined) : undefined

  const [collateral, setCollateral] = useState('') // ETH
  const [leverage, setLeverage] = useState(2)

  const positionSizeEth = collateral ? Number(collateral) * leverage : 0

  // We fetch the score to trigger state sync in other hooks but don't display it here yet
  useAttentionScore(token, chainId)

  const { write, data } = useContractWrite({
    address: futures,
    abi: attentionFuturesAbi,
    functionName: 'openPosition',
    args: [token, isLong, BigInt(leverage)],
    value: collateral ? BigInt(Math.floor(Number(collateral) * 1e18)) : undefined,
  })

  // keep listening for tx confirmation to refresh UI later
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _tx = useWaitForTransaction({ hash: data?.hash })

  const submit = () => {
    if (!address) return toast.error('Connect wallet')
    if (!collateral) return toast.error('Enter collateral')
    write?.()
  }

  const selectLong = () => {
    if (!isLong) onToggle()
  }

  const selectShort = () => {
    if (isLong) onToggle()
  }

  return (
    <OrderTicketUI
      isLong={isLong}
      onSelectLong={selectLong}
      onSelectShort={selectShort}
      collateral={collateral}
      onCollateralChange={setCollateral}
      leverage={leverage}
      onLeverageChange={setLeverage}
      positionSize={positionSizeEth}
      onSubmit={submit}
      walletConnected={!!address}
    />
  )
} 