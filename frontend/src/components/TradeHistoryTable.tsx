'use client'

import { ClosedTrade } from '@/hooks/useFuturesEvents'

interface Props {
  trades: ClosedTrade[]
}

export default function TradeHistoryTable({ trades }: Props) {
  return (
    <table className="w-full text-xs md:text-sm">
      <thead className="text-left text-gray-400 border-b border-white/10">
        <tr>
          <th className="py-2">ID</th>
          <th>PnL</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {trades.slice().reverse().map((t) => (
          <tr key={t.id.toString()} className="border-b border-white/5 hover:bg-white/5">
            <td className="py-2 font-mono">{t.id.toString()}</td>
            <td className={Number(t.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}>
              {(Number(t.pnl) / 1e18).toFixed(6)} ETH
            </td>
            <td>{new Date(t.timestamp * 1000).toLocaleString() || '--'}</td>
          </tr>
        ))}
        {trades.length === 0 && (
          <tr>
            <td colSpan={3} className="py-8 text-center text-gray-500">No trades yet</td>
          </tr>
        )}
      </tbody>
    </table>
  )
} 