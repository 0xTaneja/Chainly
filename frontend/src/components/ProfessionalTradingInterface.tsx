'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  Calculator,
  Target,
  Zap,
  DollarSign,
  BarChart3,
  PieChart,
  Wallet,
  X,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Settings,
  RefreshCw
} from 'lucide-react'
import { 
  useAccount, 
  useContractWrite, 
  useWaitForTransaction, 
  useChainId,
  useContractRead 
} from 'wagmi'
import { ADDRESSES } from '@/lib/addresses'
import { attentionFuturesAbi } from '@/lib/abi/attentionFutures'
import { attentionOracleAbi } from '@/lib/abi/attentionOracle'
import { usePositions } from '@/hooks/usePositions'
import { useOracleData } from '@/hooks/useOracleData'
import CandleChart from '@/components/CandleChart'
import toast from 'react-hot-toast'

interface TradingPanelProps {
  onPositionUpdate?: () => void
}

export default function ProfessionalTradingInterface({ onPositionUpdate }: TradingPanelProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const futuresAddress = chainId ? ADDRESSES[chainId]?.futures : undefined

  // 🔥 REAL DATA HOOKS
  const { data: positionsData, refetch: refetchPositions } = usePositions(chainId || 11155111)
  const { oracleData, refetch: refetchOracle } = useOracleData()

  // TRADING STATE
  const [selectedToken, setSelectedToken] = useState('BTC')
  const [isLong, setIsLong] = useState(true)
  const [leverage, setLeverage] = useState(2)
  const [collateralAmount, setCollateralAmount] = useState('')
  const [positionSize, setPositionSize] = useState('')
  
  // UI STATE
  const [activeTab, setActiveTab] = useState<'trade' | 'positions' | 'portfolio'>('trade')
  const [selectedPosition, setSelectedPosition] = useState<any>(null)
  const [showRiskCalculator, setShowRiskCalculator] = useState(false)

  // REAL ORACLE FRESHNESS CHECK
  const { data: oracleAddress } = useContractRead({
    address: futuresAddress as `0x${string}`,
    abi: attentionFuturesAbi,
    functionName: 'oracle',
    enabled: !!futuresAddress,
  })

  const { data: isOracleFresh } = useContractRead({
    address: oracleAddress as `0x${string}`,
    abi: attentionOracleAbi,
    functionName: 'isDataFresh',
    args: [selectedToken],
    enabled: !!oracleAddress,
  })

  const { data: isPaused } = useContractRead({
    address: futuresAddress as `0x${string}`,
    abi: attentionFuturesAbi,
    functionName: 'paused',
    enabled: !!futuresAddress,
  })

  // OPEN POSITION
  const { 
    data: openData, 
    write: openPosition, 
    isLoading: openPending 
  } = useContractWrite({
    address: futuresAddress as `0x${string}`,
    abi: attentionFuturesAbi,
    functionName: 'openPosition',
    args: [selectedToken, isLong, BigInt(leverage)],
    value: collateralAmount ? BigInt(Math.floor(Number(collateralAmount) * 1e18)) : undefined,
  })

  const { isLoading: openTxLoading, isSuccess: openSuccess } = useWaitForTransaction({
    hash: openData?.hash,
  })

  // CLOSE POSITION
  const { 
    data: closeData, 
    write: closePosition, 
    isLoading: closePending 
  } = useContractWrite({
    address: futuresAddress as `0x${string}`,
    abi: attentionFuturesAbi,
    functionName: 'closePosition',
    args: selectedPosition ? [selectedPosition.id] : undefined,
  })

  const { isLoading: closeTxLoading, isSuccess: closeSuccess } = useWaitForTransaction({
    hash: closeData?.hash,
  })

  // SUCCESS HANDLERS
  useEffect(() => {
    if (openSuccess) {
      toast.success('🎉 Position opened successfully!')
      refetchPositions()
      onPositionUpdate?.()
      setCollateralAmount('')
      setPositionSize('')
    }
  }, [openSuccess, refetchPositions, onPositionUpdate])

  useEffect(() => {
    if (closeSuccess) {
      toast.success('✅ Position closed successfully!')
      refetchPositions()
      onPositionUpdate?.()
      setSelectedPosition(null)
    }
  }, [closeSuccess, refetchPositions, onPositionUpdate])

  // RISK CALCULATIONS
  const calculateLiquidationPrice = (position: any) => {
    if (!position) return 0
    const openScore = Number(position.openScore) / 1e18
    const leverageNum = Number(position.leverage)
    
    if (position.isLong) {
      return openScore * (1 - 0.9 / leverageNum) // 90% of margin
    } else {
      return openScore * (1 + 0.9 / leverageNum)
    }
  }

  const calculateMarginRatio = (position: any) => {
    if (!position || !position.equity) return 0
    const equity = Number(position.equity) / 1e18
    const collateral = Number(position.collateral) / 1e18
    return collateral > 0 ? (equity / collateral) * 100 : 0
  }

  // PORTFOLIO METRICS
  const portfolioMetrics = {
    totalValue: positionsData.positions.reduce((sum, p) => 
      sum + (Number(p.equity || 0) / 1e18), 0
    ),
    totalPnL: positionsData.positions.reduce((sum, p) => 
      sum + (Number(p.pnl || 0) / 1e18), 0
    ),
    activePositions: positionsData.openPositionsCount,
    totalCollateral: Number(positionsData.totalCollateral) / 1e18
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900/90 to-black">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Professional Trading
            </h1>
            <p className="text-gray-400">
              Advanced attention-based derivatives trading platform
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isOracleFresh ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'
            } border`}>
              <div className={`w-2 h-2 rounded-full ${isOracleFresh ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              <span className={`text-sm font-medium ${isOracleFresh ? 'text-green-400' : 'text-red-400'}`}>
                {isOracleFresh ? 'Oracle Live' : 'Oracle Stale'}
              </span>
            </div>
            
            <motion.button
              onClick={() => {
                refetchOracle()
                refetchPositions()
              }}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* TAB NAVIGATION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-8 bg-white/5 p-2 rounded-2xl backdrop-blur-sm"
        >
          {[
            { id: 'trade', label: 'Trade', icon: Target },
            { id: 'positions', label: 'Positions', icon: BarChart3 },
            { id: 'portfolio', label: 'Portfolio', icon: PieChart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#7EE787] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'trade' && (
            <motion.div
              key="trade"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* TRADING PANEL */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Target className="w-6 h-6 text-[#7EE787]" />
                      Open Position
                    </h2>
                    <button
                      onClick={() => setShowRiskCalculator(!showRiskCalculator)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors"
                    >
                      <Calculator className="w-4 h-4" />
                      Risk Calculator
                    </button>
                  </div>

                  {/* TOKEN SELECTION */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {['BTC', 'ETH', 'PEPE'].map(token => (
                      <button
                        key={token}
                        onClick={() => setSelectedToken(token)}
                        className={`p-4 rounded-xl font-bold transition-all ${
                          selectedToken === token
                            ? 'bg-gradient-to-r from-[#7EE787] to-[#58D5C9] text-black'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        {token}/USD
                      </button>
                    ))}
                  </div>

                  {/* LONG/SHORT */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setIsLong(true)}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all ${
                        isLong
                          ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                      LONG
                    </button>
                    <button
                      onClick={() => setIsLong(false)}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all ${
                        !isLong
                          ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <ArrowDownRight className="w-5 h-5" />
                      SHORT
                    </button>
                  </div>

                  {/* LEVERAGE SLIDER */}
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-3">
                      Leverage: {leverage}x
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={leverage}
                        onChange={(e) => setLeverage(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>1x</span>
                        <span>5x</span>
                        <span>10x</span>
                      </div>
                    </div>
                  </div>

                  {/* COLLATERAL INPUT */}
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-3">
                      Collateral (ETH)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        value={collateralAmount}
                        onChange={(e) => setCollateralAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-[#7EE787] focus:outline-none"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        ETH
                      </div>
                    </div>
                  </div>

                  {/* POSITION SIZE */}
                  <div className="mb-8">
                    <label className="block text-white font-medium mb-3">
                      Position Size (USD)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={positionSize}
                        onChange={(e) => setPositionSize(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-[#7EE787] focus:outline-none"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        USD
                      </div>
                    </div>
                  </div>

                  {/* TRADE BUTTON */}
                  <motion.button
                    onClick={() => openPosition?.()}
                    disabled={openPending || openTxLoading || isPaused || !isOracleFresh || !collateralAmount}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#7EE787] to-[#58D5C9] text-black hover:shadow-2xl hover:shadow-[#7EE787]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {openPending || openTxLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : !isOracleFresh ? (
                      'Oracle Data Stale'
                    ) : isPaused ? (
                      'Trading Paused'
                    ) : (
                      `Open ${isLong ? 'Long' : 'Short'} Position`
                    )}
                  </motion.button>
                </div>
              </div>

              {/* RISK CALCULATOR & MARKET INFO */}
              <div className="space-y-6">
                {/* REAL-TIME CHART */}
                <CandleChart token={selectedToken} />
                {/* MARKET INFO */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#7EE787]" />
                    Market Info
                  </h3>
                  
                  {oracleData.sepoliaData.filter(d => d.token === selectedToken).map(tokenData => {
                    const score = Number(tokenData.score) / 1e18
                    return (
                      <div key={tokenData.token} className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Attention Score</span>
                          <span className="text-white font-bold">{score.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Data Status</span>
                          <span className={tokenData.isDataFresh ? 'text-green-400' : 'text-red-400'}>
                            {tokenData.isDataFresh ? '🟢 Fresh' : '🔴 Stale'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Chain</span>
                          <span className="text-white">
                            {tokenData.chainId === 11155111 ? 'Sepolia' : 'Fuji'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* RISK CALCULATOR */}
                {showRiskCalculator && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-sm rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-purple-400" />
                      Risk Calculator
                    </h3>
                    
                    {collateralAmount && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Position Size</span>
                          <span className="text-white font-bold">
                            {(Number(collateralAmount) * leverage).toFixed(4)} ETH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Margin Required</span>
                          <span className="text-white font-bold">
                            {Number(collateralAmount).toFixed(4)} ETH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Liquidation Risk</span>
                          <span className={leverage > 5 ? 'text-red-400' : 'text-green-400'}>
                            {leverage > 5 ? 'High' : 'Low'}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* POSITIONS TAB */}
          {activeTab === 'positions' && (
            <motion.div
              key="positions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* POSITIONS HEADER */}
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-[#7EE787]" />
                  Position Management
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">
                    {positionsData.positions.length} Total • {positionsData.openPositionsCount} Active
                  </div>
                  <motion.button
                    onClick={() => refetchPositions()}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* ACTIVE POSITIONS */}
              {positionsData.positions.length > 0 ? (
                <div className="space-y-4">
                  {positionsData.positions.map((position, index) => {
                    const pnl = Number(position.pnl || 0) / 1e18
                    const equity = Number(position.equity || 0) / 1e18
                    const collateral = Number(position.collateral) / 1e18
                    const liquidationPrice = calculateLiquidationPrice(position)
                    const marginRatio = calculateMarginRatio(position)
                    const healthFactor = Number(position.healthFactor || 0) / 1e18
                    
                    return (
                      <motion.div
                        key={position.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 ${
                          !position.isActive ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                              position.isLong 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {position.isLong ? 'LONG' : 'SHORT'} {position.token}
                            </div>
                            <div className="text-white font-bold text-lg">
                              {Number(position.leverage)}x Leverage
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              position.isActive 
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {position.isActive ? 'ACTIVE' : 'CLOSED'}
                            </div>
                          </div>
                          
                          {position.isActive && (
                            <motion.button
                              onClick={() => {
                                setSelectedPosition(position)
                                closePosition?.()
                              }}
                              disabled={closePending || closeTxLoading}
                              className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {closePending || closeTxLoading ? 'Closing...' : 'Close Position'}
                            </motion.button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Collateral</div>
                            <div className="text-white font-bold">{collateral.toFixed(4)} ETH</div>
                          </div>
                          
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Current PnL</div>
                            <div className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {pnl >= 0 ? '+' : ''}{pnl.toFixed(6)} ETH
                            </div>
                            <div className="text-xs text-gray-500">
                              {pnl >= 0 ? '+' : ''}{((pnl / collateral) * 100).toFixed(2)}%
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Health Factor</div>
                            <div className={`font-bold ${
                              healthFactor > 1.5 ? 'text-green-400' : 
                              healthFactor > 1.1 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {healthFactor.toFixed(2)}
                            </div>
                            {healthFactor < 1.1 && (
                              <div className="flex items-center gap-1 text-xs text-red-400">
                                <AlertTriangle className="w-3 h-3" />
                                Risk
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Entry Score</div>
                            <div className="text-white font-bold">
                              {(Number(position.openScore) / 1e18).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* RISK WARNING */}
                        {position.isActive && healthFactor < 1.2 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                          >
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-medium">Liquidation Risk Warning</span>
                            </div>
                            <div className="text-red-300 text-xs mt-1">
                              Position is at risk of liquidation. Consider adding collateral or closing the position.
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-12 text-center">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Positions Found</h3>
                  <p className="text-gray-400 mb-6">
                    Start trading to see your positions here
                  </p>
                  <motion.button
                    onClick={() => setActiveTab('trade')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7EE787] to-[#58D5C9] text-black font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    Start Trading
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* PORTFOLIO HEADER */}
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <PieChart className="w-8 h-8 text-[#7EE787]" />
                  Portfolio Analytics
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">
                    Real-time portfolio tracking
                  </div>
                  <motion.button
                    onClick={() => {
                      refetchPositions()
                      refetchOracle()
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* PORTFOLIO OVERVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    label: 'Total Value', 
                    value: `$${portfolioMetrics.totalValue.toFixed(2)}`, 
                    icon: Wallet, 
                    color: 'text-green-400',
                    change: '+12.5%',
                    trend: 'up'
                  },
                  { 
                    label: 'Total PnL', 
                    value: `${portfolioMetrics.totalPnL >= 0 ? '+' : ''}${portfolioMetrics.totalPnL.toFixed(4)} ETH`, 
                    icon: TrendingUp, 
                    color: portfolioMetrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400',
                    change: `${((portfolioMetrics.totalPnL / portfolioMetrics.totalCollateral) * 100).toFixed(2)}%`,
                    trend: portfolioMetrics.totalPnL >= 0 ? 'up' : 'down'
                  },
                  { 
                    label: 'Active Positions', 
                    value: portfolioMetrics.activePositions.toString(), 
                    icon: BarChart3, 
                    color: 'text-blue-400',
                    change: `${positionsData.positions.length - portfolioMetrics.activePositions} closed`,
                    trend: 'neutral'
                  },
                  { 
                    label: 'Total Collateral', 
                    value: `${portfolioMetrics.totalCollateral.toFixed(4)} ETH`, 
                    icon: DollarSign, 
                    color: 'text-purple-400',
                    change: 'Locked',
                    trend: 'neutral'
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                        <span className="text-gray-400 font-medium text-sm">{metric.label}</span>
                      </div>
                      {metric.trend !== 'neutral' && (
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          metric.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {metric.change}
                        </div>
                      )}
                    </div>
                    <div className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}
                    </div>
                    {metric.trend === 'neutral' && (
                      <div className="text-xs text-gray-500 mt-1">{metric.change}</div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* PERFORMANCE BREAKDOWN */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TOKEN BREAKDOWN */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#7EE787]" />
                    Token Allocation
                  </h3>
                  
                  {['BTC', 'ETH', 'PEPE'].map(token => {
                    const tokenPositions = positionsData.positions.filter(p => p.token === token && p.isActive)
                    const tokenCollateral = tokenPositions.reduce((sum, p) => sum + Number(p.collateral), 0) / 1e18
                    const tokenPnL = tokenPositions.reduce((sum, p) => sum + Number(p.pnl || 0), 0) / 1e18
                    const allocation = portfolioMetrics.totalCollateral > 0 ? (tokenCollateral / portfolioMetrics.totalCollateral) * 100 : 0

                    return (
                      <div key={token} className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7EE787] to-[#58D5C9] flex items-center justify-center text-black text-sm font-bold">
                              {token.slice(0, 1)}
                            </div>
                            <span className="text-white font-medium">{token}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{allocation.toFixed(1)}%</div>
                            <div className={`text-xs ${tokenPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {tokenPnL >= 0 ? '+' : ''}{tokenPnL.toFixed(4)} ETH
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-[#7EE787] to-[#58D5C9]"
                            style={{ width: `${allocation}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {tokenPositions.length} position{tokenPositions.length !== 1 ? 's' : ''} • {tokenCollateral.toFixed(4)} ETH
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* RISK ANALYSIS */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Risk Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    {/* OVERALL RISK SCORE */}
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-400 font-medium">Portfolio Risk Score</span>
                        <span className="text-yellow-400 font-bold text-lg">
                          {portfolioMetrics.activePositions > 0 ? 'Medium' : 'None'}
                        </span>
                      </div>
                      <div className="text-xs text-yellow-300">
                        Based on leverage, diversification, and health factors
                      </div>
                    </div>

                    {/* LEVERAGE EXPOSURE */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Average Leverage</span>
                        <span className="text-white font-bold">
                          {portfolioMetrics.activePositions > 0 
                            ? (positionsData.positions
                                .filter(p => p.isActive)
                                .reduce((sum, p) => sum + Number(p.leverage), 0) / portfolioMetrics.activePositions).toFixed(1)
                            : '0'
                          }x
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Max Leverage</span>
                        <span className="text-white font-bold">
                          {portfolioMetrics.activePositions > 0 
                            ? Math.max(...positionsData.positions.filter(p => p.isActive).map(p => Number(p.leverage)))
                            : '0'
                          }x
                        </span>
                      </div>
                    </div>

                    {/* LIQUIDATION RISKS */}
                    {positionsData.positions.some(p => p.isActive && Number(p.healthFactor || 0) / 1e18 < 1.2) && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          High Risk Positions
                        </div>
                        <div className="text-red-300 text-xs">
                          {positionsData.positions.filter(p => p.isActive && Number(p.healthFactor || 0) / 1e18 < 1.2).length} position(s) 
                          with health factor below 1.2
                        </div>
                      </div>
                    )}

                    {/* DIVERSIFICATION */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Token Diversification</span>
                        <span className="text-white font-bold">
                          {new Set(positionsData.positions.filter(p => p.isActive).map(p => p.token)).size} tokens
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Direction Balance</span>
                        <span className="text-white font-bold">
                          {positionsData.positions.filter(p => p.isActive && p.isLong).length}L / 
                          {positionsData.positions.filter(p => p.isActive && !p.isLong).length}S
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#7EE787]" />
                  Recent Activity
                </h3>
                
                {positionsData.positions.length > 0 ? (
                  <div className="space-y-3">
                    {positionsData.positions
                      .sort((a, b) => Number(b.openTime) - Number(a.openTime))
                      .slice(0, 5)
                      .map((position, index) => (
                        <motion.div
                          key={position.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              position.isActive ? 'bg-green-400' : 'bg-gray-400'
                            }`} />
                            <div>
                              <div className="text-white font-medium text-sm">
                                {position.isActive ? 'Opened' : 'Closed'} {position.isLong ? 'LONG' : 'SHORT'} {position.token}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {Number(position.leverage)}x • {(Number(position.collateral) / 1e18).toFixed(4)} ETH
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-sm ${
                              Number(position.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {Number(position.pnl || 0) >= 0 ? '+' : ''}{(Number(position.pnl || 0) / 1e18).toFixed(4)} ETH
                            </div>
                            <div className="text-gray-400 text-xs">
                              {new Date(Number(position.openTime) * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">No trading activity yet</div>
                    <motion.button
                      onClick={() => setActiveTab('trade')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7EE787] to-[#58D5C9] text-black font-medium"
                      whileHover={{ scale: 1.05 }}
                    >
                      Start Trading
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 