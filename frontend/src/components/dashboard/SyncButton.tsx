'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface SyncButtonProps {
  onRefresh: () => void
  isLoading: boolean
  isSynced: boolean
}

export default function SyncButton({ onRefresh, isLoading, isSynced }: SyncButtonProps) {
  return (
    <motion.button
      onClick={onRefresh}
      disabled={isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
        ${isSynced 
          ? 'bg-axMint/10 border border-axMint/20 text-axMint hover:bg-axMint/20' 
          : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
        }
        ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-4 h-4" />
        </motion.div>
      ) : isSynced ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      
      <span>
        {isLoading ? 'Syncing...' : isSynced ? 'Synced' : 'Sync Data'}
      </span>
    </motion.button>
  )
} 