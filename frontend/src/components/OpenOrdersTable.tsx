'use client'

import { OpenOrder } from '@/hooks/useFuturesEvents'
import { attentionFuturesAbi } from '@/lib/abi/attentionFutures'
import { useContractReads } from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { useChainId } from 'wagmi'

interface Props {
  orders: OpenOrder[]
}

export default function OpenOrdersTable({ orders }: Props) {
  const chainId = useChainId()
  const futures = chainId ? (ADDRESSES[chainId]?.futures as `0x${string}` | undefined) : undefined

  const ids = orders.map((o) => o.id)

  const { data: pnls } = useContractReads({
    contracts: ids.map((id) => ({
      address: futures,
      abi: attentionFuturesAbi,
      functionName: 'calcPnl',
      args: [id],
    })),
    enabled: ids.length > 0 && !!futures,
    watch: true,
  })

  return (
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
        {orders.map((o, i) => {
          const pnl = pnls && pnls[i]?.result ? Number(pnls[i].result as bigint) / 1e18 : 0
          const size = (Number(o.collateral) / 1e18) * Number(o.leverage)
          return (
            <tr key={o.id.toString()} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-2 font-mono">{o.id.toString()}</td>
              <td>{o.token}</td>
              <td className={o.isLong ? 'text-green-400' : 'text-red-400'}>{o.isLong ? 'LONG' : 'SHORT'}</td>
              <td>{Number(o.leverage)}x</td>
              <td>{(Number(o.collateral) / 1e18).toFixed(4)} ETH</td>
              <td>{size.toFixed(4)} ETH</td>
              <td className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{pnl.toFixed(6)} ETH</td>
            </tr>
          )
        })}
        {orders.length === 0 && (
          <tr>
            <td colSpan={7} className="py-8 text-center text-gray-500">No open orders</td>
          </tr>
        )}
      </tbody>
    </table>
  )
} 