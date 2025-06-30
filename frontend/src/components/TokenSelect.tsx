import { motion } from 'framer-motion'
import { useAttentionScore } from '@/hooks/useAttentionScore'
import { useChainId } from 'wagmi'

interface Props {
  onSelect: (token: string) => void
}

const TOKENS = ['BTC', 'ETH', 'LINK', 'DOGE', 'PEPE'] as const

export default function TokenSelect({ onSelect }: Props) {
  const chainId = useChainId() || 11155111
  return (
    <div className="min-h-screen bg-axBlack text-white py-20 px-6">
      <h1 className="text-3xl font-bold text-center mb-10">Select Market</h1>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {TOKENS.map((t, i) => (
          <TokenCard key={t} token={t} chainId={chainId} onClick={() => onSelect(t)} delay={i*0.05} />
        ))}
      </div>
    </div>
  )
}

interface CardProps { token: string; chainId: number; onClick: () => void; delay: number }

function TokenCard({ token, chainId, onClick, delay }: CardProps) {
  const { data } = useAttentionScore(token, chainId)
  const score = data && data.score && data.score > BigInt(0) ? (Number(data.score)/1e18).toFixed(2) : '--'
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={onClick}
      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4"
    >
      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#7EE787] to-[#58D5C9] flex items-center justify-center text-black font-bold text-lg">
        {token}
      </div>
      <div className="text-xl font-semibold">{token}/ATTN</div>
      <div className="text-gray-400 text-sm">Score: {score}</div>
    </motion.button>
  )
} 