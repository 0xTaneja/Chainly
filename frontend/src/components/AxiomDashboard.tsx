'use client'

import React from 'react'
import { motion } from 'framer-motion'
import ModernHero from './ModernHero'
import BentoFeatures from './BentoFeatures'
import AxiomFAQ from './AxiomFAQ'

interface AxiomDashboardProps {
  onStartTrading?: () => void
}

const AxiomDashboard = ({ onStartTrading }: AxiomDashboardProps) => {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-black via-gray-900/90 to-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Modern Hero Section with Attention-focused Design */}
      <ModernHero onStartTrading={onStartTrading} />
      
      {/* Bento Grid Features Section */}
      <BentoFeatures />
      
      {/* FAQ Section */}
      <AxiomFAQ />
      
      {/* Modern Footer */}
      <footer className="relative py-16 border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Trade Attention with Chainly?
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join early traders who are already profiting from social media buzz and viral trends 
              before price movements. Trade the future of attention derivatives.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.button
              onClick={onStartTrading}
              className="group px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#7EE787] to-[#58D5C9] text-black hover:shadow-2xl hover:shadow-[#7EE787]/25 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Trading Attention
            </motion.button>
            
            <motion.button
              className="group px-8 py-4 rounded-xl font-semibold text-lg border-2 border-[#7EE787]/30 text-white hover:border-[#7EE787] hover:bg-[#7EE787]/10 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn More
            </motion.button>
          </div>
          
          <div className="border-t border-white/10 pt-8">
            <p className="text-gray-400 text-sm">
              Built with <span className="text-[#7EE787]">❤️</span> using <span className="text-white font-semibold">Chainlink</span> Functions & Automation
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Chainly - Trade attention, not price. Powered by social media oracles.
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

export default AxiomDashboard 