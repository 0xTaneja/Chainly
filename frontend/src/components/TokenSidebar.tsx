'use client'

import { useOracleData } from '@/hooks/useOracleData'
import { motion } from 'framer-motion'

interface Props {
  selected: string
  onSelect: (t: string) => void
}

export default function TokenSidebar({ selected, onSelect }: Props) {
  const { oracleData } = useOracleData()
  const tokens = ['BTC', 'ETH', 'PEPE']

  return (
    <div className="h-full bg-black/70 border-r border-white/10 p-4 space-y-2 overflow-y-auto">
      {tokens.map((t) => {
        const tokenInfo = oracleData.sepoliaData.find((d) => d.token === t)
        const price = tokenInfo ? (Number(tokenInfo.score) / 1e18).toFixed(2) : '--'
        const fresh = tokenInfo?.isDataFresh
        return (
          <motion.button
            key={t}
            onClick={() => onSelect(t)}
            whileHover={{ scale: 1.02 }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              selected === t
                ? 'bg-[#7EE787]/20 text-[#7EE787]'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <span>{t}</span>
            <span className="text-xs font-mono">{price}</span>
            <span className={`w-2 h-2 rounded-full ${fresh ? 'bg-green-400' : 'bg-yellow-400'}`} />
          </motion.button>
        )
      })}
    </div>
  )
} 