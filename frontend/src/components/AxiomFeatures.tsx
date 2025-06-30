'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import MotionSection from './MotionSection'
import { Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react'
import { CardContainer, CardBody, CardItem } from './ui/3d-card'

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Order Execution Engine",
    subtitle: "Trade with confidence.",
    description: "Our limit order execution engine is the fastest in the market. With our proprietary order execution engine and colocated nodes, our limit orders land in ≤ 1 block.",
    highlight: "Land in ≤ 1 Block"
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Wallet and Twitter Tracker",
    subtitle: "Trade and track all in one place.",
    description: "Monitor your portfolio and social sentiment in real-time. Get insights from Twitter trends and wallet analytics to make informed trading decisions.",
    highlight: "Real-time Analytics"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Hyperliquid Perpetuals",
    subtitle: "Trade leveraged Perps.",
    description: "Access deep liquidity and instant fills with our Hyperliquid integration. Trade perpetual contracts with confidence and minimal slippage.",
    highlight: "Deep Liquidity"
  },
  {
    icon: <ArrowRight className="w-8 h-8" />,
    title: "Yield",
    subtitle: "Earn while you sleep.",
    description: "Earn up to 15% APY on your assets with instant withdrawals. Our yield platform is powered by Marginfi for maximum security and returns.",
    highlight: "Up to 15% APY"
  }
]

export default function AxiomFeatures() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <MotionSection className="py-16 pb-4 bg-axBlack relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(90, 44, 124, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(90, 44, 124, 0.2) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="axiom-container relative z-10">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-0"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Our <span className="bg-gradient-to-r from-axMint via-[#9CF6EE] to-axViolet bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Advanced tools to optimize your trading experience
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <CardContainer key={feature.title} className="inter-var">
              <CardBody className="bg-axOverlay/30 relative group/card dark:hover:shadow-2xl dark:hover:shadow-axMint/[0.1] border border-white/10 w-auto sm:w-[20rem] h-auto rounded-xl p-6 hover:border-axMint/30 transition-all duration-300">
                <CardItem
                  translateZ="50"
                  className="text-axMint mb-4 group-hover:scale-110 transition-transform"
                >
                  {feature.icon}
                </CardItem>
                
                <CardItem
                  translateZ="100"
                  className="text-xl font-bold text-white mb-2"
                >
                  {feature.title}
                </CardItem>
                
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-axMint text-sm font-semibold mb-3"
                >
                  {feature.subtitle}
                </CardItem>
                
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-gray-300 text-sm leading-relaxed mb-4"
                >
                  {feature.description}
                </CardItem>
                
                <CardItem
                  translateZ="100"
                  className="inline-flex items-center gap-2 px-3 py-1 bg-axMint/10 border border-axMint/20 rounded-full text-xs"
                >
                  <div className="w-1.5 h-1.5 bg-axMint rounded-full animate-pulse" />
                  <span className="text-axMint font-semibold">
                    {feature.highlight}
                  </span>
                </CardItem>
              </CardBody>
            </CardContainer>
          ))}
        </div>

        {/* Try Advanced Ordering CTA */}

      </div>
    </MotionSection>
  )
} 