'use client'

import { usePositions } from '@/hooks/usePositions'
import { useChainId, useContractWrite, useWaitForTransaction } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionFuturesAbi } from '@/lib/abi/attentionFutures'
import clsx from 'clsx'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function PositionsTable() {
  const chainId = useChainId() || 11155111
  const { data, isLoading, error, refetch } = usePositions(chainId)

  // close position wiring
  const futuresAddress = ADDRESSES[chainId]?.futures as `0x${string}` | undefined
  const [closingId, setClosingId] = useState<bigint | null>(null)

  const {
    data: closeData,
    error: closeError,
    isLoading: isClosing,
    write: closePosition,
  } = useContractWrite({
    address: futuresAddress,
    abi: attentionFuturesAbi,
    functionName: 'closePosition',
    mode: 'recklesslyUnprepared' as any,
  })

  const { isSuccess: txSuccess, isLoading: txLoading } = useWaitForTransaction({
    hash: closeData?.hash,
  })

  useEffect(() => {
    if (closeError) {
      toast.error(closeError.message || 'Close position failed')
      setClosingId(null)
    }
  }, [closeError])

  useEffect(() => {
    if (txSuccess) {
      toast.success('Position closed')
      setClosingId(null)
      refetch()
    }
  }, [txSuccess, refetch])

  const handleClose = async (id: bigint) => {
    if (!closePosition) return toast.error('closePosition not ready')
    try {
      setClosingId(id)
      await closePosition({ args: [id] })
      toast.success('Tx sent')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send tx')
      setClosingId(null)
    }
  }

  if (isLoading) return <p className="py-8 text-center text-gray-500">Loading positions...</p>
  if (error) return (
    <p className="py-8 text-center text-red-500">Error: {error}</p>
  )

  const positions = data?.positions ?? []

  const openPositions = positions.filter((p) => p.isActive)
  const closedPositions = positions.filter((p) => !p.isActive)

  return (
    <div>
      {/* Open Positions Table */}
      <table className="w-full text-xs md:text-sm">
        <thead className="text-left text-gray-400 border-b border-white/10">
          <tr>
            <th className="py-2">ID</th>
            <th>Token</th>
            <th>Dir</th>
            <th>Lev</th>
            <th>Collateral</th>
            <th>Size</th>
            <th>PnL</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {openPositions.map((p) => {
            const pnl = Number(p.pnl ?? BigInt(0)) / 1e18
            const size = (Number(p.collateral) / 1e18) * Number(p.leverage)
            const isPending = closingId === p.id && (isClosing || txLoading)
            return (
              <tr key={p.id.toString()} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-2 font-mono">{p.id.toString()}</td>
                <td>{p.token}</td>
                <td className={p.isLong ? 'text-green-400' : 'text-red-400'}>{p.isLong ? 'LONG' : 'SHORT'}</td>
                <td>{Number(p.leverage)}x</td>
                <td>{(Number(p.collateral) / 1e18).toFixed(4)} ETH</td>
                <td>{size.toFixed(4)} ETH</td>
                <td className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{pnl.toFixed(8)} ETH</td>
                <td className="text-right py-2">
                  <button
                    onClick={() => handleClose(p.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isPending ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <XMarkIcon className="h-4 w-4" />
                    )}
                    <span className="hidden md:inline">Close</span>
                  </button>
                </td>
              </tr>
            )
          })}
          {openPositions.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-gray-500">No open positions</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Closed Positions Accordion */}
      <details className="mt-6 bg-white/5 rounded-lg">
        <summary className="cursor-pointer px-4 py-2 select-none text-gray-300 hover:text-gray-100">
          Closed positions ({closedPositions.length})
        </summary>

        <div className="p-4">
    <table className="w-full text-xs md:text-sm">
      <thead className="text-left text-gray-400 border-b border-white/10">
        <tr>
          <th className="py-2">ID</th>
          <th>Token</th>
          <th>Dir</th>
          <th>Lev</th>
          <th>Collateral</th>
          <th>Size</th>
          <th>PnL</th>
        </tr>
      </thead>
      <tbody>
              {closedPositions.map((p) => {
                const pnlWei = p.realizedPnl ?? BigInt(0)
          const pnl = Number(pnlWei) / 1e18
          const size = (Number(p.collateral) / 1e18) * Number(p.leverage)
          return (
            <tr key={p.id.toString()} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-2 font-mono">{p.id.toString()}</td>
              <td>{p.token}</td>
              <td className={p.isLong ? 'text-green-400' : 'text-red-400'}>{p.isLong ? 'LONG' : 'SHORT'}</td>
              <td>{Number(p.leverage)}x</td>
              <td>{(Number(p.collateral) / 1e18).toFixed(4)} ETH</td>
              <td>{size.toFixed(4)} ETH</td>
                    <td className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{pnl.toFixed(8)} ETH</td>
            </tr>
          )
        })}
              {closedPositions.length === 0 && (
          <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">No closed positions</td>
          </tr>
        )}
      </tbody>
    </table>
        </div>
      </details>
    </div>
  )
} 