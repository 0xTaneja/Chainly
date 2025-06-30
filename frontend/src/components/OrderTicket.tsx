'use client'

import { useState, useMemo } from 'react'
import { useAccount, useChainId, useContractWrite, useWaitForTransaction, useContractRead } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionFuturesAbi } from '@/lib/abi/attentionFutures'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useAttentionScore } from '@/hooks/useAttentionScore'

interface Props {
  token: string
  isLong: boolean
  onToggle: () => void
}

export default function OrderTicket({ token, isLong, onToggle }: Props) {
  const { address } = useAccount()
  const chainId = useChainId()
  const futures = chainId ? (ADDRESSES[chainId]?.futures as `0x${string}` | undefined) : undefined

  const [collateral, setCollateral] = useState('') // ETH
  const [leverage, setLeverage] = useState(2)
  const [tp, setTp] = useState('')
  const [sl, setSl] = useState('')

  const positionSizeEth = collateral ? Number(collateral) * leverage : 0

  const { data: isPaused } = useContractRead({
    address: futures,
    abi: attentionFuturesAbi,
    functionName: 'paused',
    enabled: !!futures,
  })

  const { data: scoreData } = useAttentionScore(token, chainId)
  const currentScore = scoreData?.score ? Number(scoreData.score) : 0

  const liquidationScore = useMemo(() => {
    if(!currentScore || !leverage) return 0
    const delta = currentScore / leverage
    return isLong ? currentScore - delta : currentScore + delta
  }, [currentScore, leverage, isLong])

  const { write, data, isLoading: pending } = useContractWrite({
    address: futures,
    abi: attentionFuturesAbi,
    functionName: 'openPosition',
    args: [token, isLong, BigInt(leverage)],
    value: collateral ? BigInt(Math.floor(Number(collateral) * 1e18)) : undefined,
  })

  const { isLoading: mining, isSuccess } = useWaitForTransaction({ hash: data?.hash })

  const submit = () => {
    if (!address) return toast.error('Connect wallet')
    if (!collateral) return toast.error('Enter collateral')
    write?.()
  }

  return (
    <div className="h-full bg-black/70 border-l border-white/10 p-4 flex flex-col">
      <div className="flex gap-2 mb-4">
        <button
          onClick={onToggle}
          className={`flex-1 py-2 rounded-lg font-semibold ${isLong ? 'bg-green-600' : 'bg-white/5'} text-white`}
        >
          Long
        </button>
        <button
          onClick={onToggle}
          className={`flex-1 py-2 rounded-lg font-semibold ${!isLong ? 'bg-red-600' : 'bg-white/5'} text-white`}
        >
          Short
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        <div>
          <label className="text-xs text-gray-400">Collateral (ETH)</label>
          <input
            value={collateral}
            onChange={(e) => setCollateral(e.target.value)}
            type="number"
            step="0.001"
            className="w-full p-2 rounded-lg bg-white/5 text-white"
          />
        </div>

        <label className="text-xs text-gray-400">Leverage {leverage}x</label>
        <input
          type="range"
          min={1}
          max={10}
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="w-full mb-4"
        />

        <label className="text-xs text-gray-400">Take Profit (score) optional</label>
        <input value={tp} onChange={(e)=>setTp(e.target.value)} type="number" step="1" className="w-full p-2 rounded-lg bg-white/5 text-white mb-4" />

        <label className="text-xs text-gray-400">Stop Loss (score) optional</label>
        <input value={sl} onChange={(e)=>setSl(e.target.value)} type="number" step="1" className="w-full p-2 rounded-lg bg-white/5 text-white mb-4" />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={submit}
        disabled={pending || mining || isPaused}
        className="py-3 rounded-lg bg-gradient-to-r from-[#7EE787] to-[#58D5C9] text-black font-semibold disabled:opacity-50">
        {pending || mining ? 'Processing…' : `Open ${isLong ? 'Long' : 'Short'}`}
      </motion.button>

      {/* Risk metrics */}
      {collateral && (
        <div className="mt-4 text-xs space-y-1 text-gray-400">
          <div className="flex justify-between"><span>Position size</span><span className="text-white font-semibold">{positionSizeEth.toFixed(4)} ETH</span></div>
          <div className="flex justify-between"><span>Margin used</span><span className="text-white font-semibold">{collateral} ETH</span></div>
          <div className="flex justify-between"><span>Liquidation score</span><span className="text-white font-semibold">{liquidationScore.toFixed(0)}</span></div>
        </div>
      )}
    </div>
  )
} 