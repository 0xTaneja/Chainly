'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ChainStatusIndicatorProps {
  chainId: number
}

const CHAIN_CONFIG = {
  11155111: {
    name: 'Sepolia',
    color: 'bg-blue-500',
    textColor: 'text-blue-400'
  },
  43113: {
    name: 'Fuji',
    color: 'bg-red-500', 
    textColor: 'text-red-400'
  }
}

export default function ChainStatusIndicator({ chainId }: ChainStatusIndicatorProps) {
  const config = CHAIN_CONFIG[chainId as keyof typeof CHAIN_CONFIG]
  
  if (!config) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        <span className="text-yellow-400 text-sm font-medium">Unknown Chain</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-2 bg-axOverlay/30 border border-white/10 rounded-lg backdrop-blur-sm"
    >
      <motion.div 
        className={`w-2 h-2 ${config.color} rounded-full`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className={`${config.textColor} text-sm font-medium`}>
        {config.name}
      </span>
    </motion.div>
  )
} 