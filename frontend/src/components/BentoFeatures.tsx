'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Shield, 
  BarChart3, 
  Eye, 
  Sparkles, 
  Target,
  ChartLine,
  Gauge,
  Clock,
  Twitter,
  MessageCircle
} from 'lucide-react'

const features = [
  {
    title: "Attention Futures Trading",
    description: "Trade 24h, 48h, and 7-day attention contracts. Go long on PEPE mentions or short DOGE hype before price moves.",
    icon: Target,
    gradient: "from-purple-500/20 to-pink-500/20",
    borderGradient: "from-purple-500/40 to-pink-500/40",
    size: "large", // Takes 2 columns
    visual: (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 flex items-center justify-center">
            <Target className="w-16 h-16 text-purple-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full animate-pulse" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-500" />
        </div>
      </div>
    )
  },
  {
    title: "Social Media Oracles",
    description: "Chainlink Functions fetch real-time data from Twitter, Reddit & Farcaster.",
    icon: MessageCircle,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderGradient: "from-blue-500/40 to-cyan-500/40",
    size: "medium",
    visual: (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <MessageCircle className="w-12 h-12 text-blue-400" />
        </motion.div>
      </div>
    )
  },
  {
    title: "Attention Index Scores",
    description: "Real-time attention metrics aggregated from multiple social platforms.",
    icon: BarChart3,
    gradient: "from-cyan-500/20 to-teal-500/20",
    borderGradient: "from-cyan-500/40 to-teal-500/40",
    size: "medium",
    visual: (
      <div className="relative h-full flex items-center justify-center">
        <div className="relative">
          <BarChart3 className="w-12 h-12 text-cyan-400" />
          <motion.div
            className="absolute inset-0 border-2 border-cyan-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    )
  },
  {
    title: "Viral Trend Prediction",
    description: "AI-powered analysis identifies meme coins and tokens about to explode in social mentions before price reacts.",
    icon: TrendingUp,
    gradient: "from-green-500/20 to-emerald-500/20",
    borderGradient: "from-green-500/40 to-emerald-500/40",
    size: "large",
    visual: (
      <div className="h-full flex items-center justify-center">
        <div className="relative w-full max-w-xs">
          <div className="flex items-end gap-2 h-24">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="bg-gradient-to-t from-green-500 to-emerald-400 rounded-t"
                style={{ width: "20px" }}
                initial={{ height: Math.random() * 40 + 20 }}
                animate={{ height: Math.random() * 60 + 30 }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
          <TrendingUp className="absolute -top-2 -right-2 w-8 h-8 text-green-400" />
        </div>
      </div>
    )
  },
  {
    title: "Leveraged Attention Tokens",
    description: "3X leveraged exposure to attention gains with tokens like PEPE3XATTN.",
    icon: Zap,
    gradient: "from-yellow-500/20 to-orange-500/20",
    borderGradient: "from-yellow-500/40 to-orange-500/40",
    size: "medium",
    visual: (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-12 h-12 text-yellow-400" />
        </motion.div>
      </div>
    )
  },
  {
    title: "Automated Settlement",
    description: "Chainlink Automation settles contracts based on attention data at expiry.",
    icon: Clock,
    gradient: "from-rose-500/20 to-red-500/20",
    borderGradient: "from-rose-500/40 to-red-500/40",
    size: "medium",
    visual: (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <Clock className="w-12 h-12 text-rose-400" />
          <motion.div
            className="absolute top-1/2 left-1/2 w-1 h-4 bg-rose-400 origin-bottom"
            style={{ transformOrigin: "bottom center", x: "-50%", y: "-100%" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    )
  }
]

export default function BentoFeatures() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#7EE787]/10 to-[#58D5C9]/10 border border-[#7EE787]/20 mb-6">
            <Sparkles className="w-4 h-4 text-[#7EE787]" />
            <span className="text-[#7EE787] text-sm font-medium">Revolutionary Trading Instruments</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Trade Attention,{" "}
            <span className="bg-gradient-to-r from-[#7EE787] to-[#58D5C9] bg-clip-text text-transparent">
              Not Price
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Be the first to trade the most valuable resource in crypto - attention. 
            Front-run price movements by trading social buzz, viral trends, and meme coin hype.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`
                relative group overflow-hidden rounded-2xl border backdrop-blur-sm
                ${feature.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'}
                ${feature.size === 'large' ? 'min-h-[300px]' : 'min-h-[250px]'}
                bg-gradient-to-br ${feature.gradient}
                border-gradient-to-br ${feature.borderGradient}
              `}
              style={{
                background: `linear-gradient(135deg, ${feature.gradient.replace('from-', '').replace('/20', '/10').replace(' to-', ', ')})`,
                borderImage: `linear-gradient(135deg, ${feature.borderGradient.replace('from-', '').replace('/40', '/30').replace(' to-', ', ')}) 1`
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), 
                      linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
                      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Visual Element */}
                <div className="flex-1 flex items-center justify-center">
                  {feature.visual}
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-20"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Trade the Future of Attention?
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join early traders who are already profiting from social sentiment before price moves. 
            Start with $PEPE attention futures or create your own viral trend predictions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#7EE787] to-[#58D5C9] text-black hover:shadow-2xl hover:shadow-[#7EE787]/25 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Trading Attention
            </motion.button>
            
            <motion.button
              className="px-8 py-4 rounded-xl font-semibold text-lg border-2 border-[#7EE787]/30 text-white hover:border-[#7EE787] hover:bg-[#7EE787]/10 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              View Documentation
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 