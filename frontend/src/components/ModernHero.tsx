'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Zap, Brain, Target, ChartLine } from 'lucide-react'

interface ModernHeroProps {
  onStartTrading?: () => void
}

export default function ModernHero({ onStartTrading }: ModernHeroProps) {
  const handleStartTrading = () => {
    if (onStartTrading) {
      onStartTrading()
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(126, 231, 135, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(126, 231, 135, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'float 20s ease-in-out infinite'
        }}
      />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#7EE787]/20 to-[#58D5C9]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#58D5C9]/20 to-[#7EE787]/20 rounded-full blur-3xl animate-pulse delay-2000" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#7EE787]/10 to-[#58D5C9]/10 border border-[#7EE787]/20 backdrop-blur-sm mb-8"
          >
            <Brain className="w-4 h-4 text-[#7EE787]" />
            <span className="text-[#7EE787] text-sm font-medium">Powered by Chainlink Oracles</span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#7EE787] via-[#58D5C9] to-[#7C3AED] bg-clip-text text-transparent animate-gradient bg-[length:200%]">
                Chainly
              </span>
              <br />
              <span className="text-white">Attention Derivatives</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Trade <span className="text-[#7EE787] font-semibold">social media attention</span> instead of price. 
              Speculate on viral trends, meme coin buzz, and digital attention across Twitter, Reddit, Farcaster & more.
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {[
              { icon: Target, text: 'Long/Short Attention Contracts' },
              { icon: Zap, text: 'Twitter & Reddit Tracking' },
              { icon: ChartLine, text: 'Viral Trend Prediction' },
              { icon: TrendingUp, text: 'Front-run Price with Attention' }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <item.icon className="w-4 h-4 text-[#7EE787]" />
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.button
              onClick={handleStartTrading}
              className="group relative px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#7EE787] to-[#58D5C9] text-black hover:shadow-2xl hover:shadow-[#7EE787]/25 transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Trade Attention Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#58D5C9] to-[#7EE787] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
            
            <motion.button
              onClick={() => window.location.href = '/trade'}
              className="group px-8 py-4 rounded-xl font-semibold text-lg border-2 border-purple-500/50 text-purple-300 hover:border-purple-400 hover:bg-purple-500/10 hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Advanced Trading
              </span>
            </motion.button>
            
            <motion.button
              className="group px-8 py-4 rounded-xl font-semibold text-lg border-2 border-[#7EE787]/30 text-white hover:border-[#7EE787] hover:bg-[#7EE787]/10 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Learn How It Works
            </motion.button>
          </motion.div>

          {/* Real-time Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { label: 'Social Mentions Tracked', value: '2.4M+', suffix: '', prefix: '' },
              { label: 'Viral Predictions', value: '847', suffix: '', prefix: '' },
              { label: 'Attention Volume', value: '12.8', suffix: 'M', prefix: '$' },
              { label: 'Trend Accuracy', value: '92.7', suffix: '%', prefix: '' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-[#7EE787] mb-2">
                  {stat.prefix}{stat.value}{stat.suffix}
                </div>
                <div className="text-gray-400 font-medium text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating Attention Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#7EE787] rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  )
}

// CSS for gradient animation
const styles = `
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-gradient {
  animation: gradient 3s ease infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
` 