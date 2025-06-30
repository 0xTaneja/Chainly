'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import CountUp from 'react-countup'
import { ArrowRight, TrendingUp, Zap, Shield } from 'lucide-react'
import { cn, buttonVariants } from '@/lib/utils'
import { BackgroundBeams } from './ui/background-beams'

interface AxiomHeroProps {
  onStartTrading?: () => void
}

export default function AxiomHero({ onStartTrading }: AxiomHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleStartTrading = () => {
    if (onStartTrading) {
      onStartTrading()
    } else {
      // Navigate to dashboard
      router.push('/dashboard')
    }
  }

  const stats = [
    { label: 'Block Time', value: 1, suffix: '', prefix: '≤ ' },
    { label: 'Total Volume', value: 2.5, suffix: 'B+', prefix: '$' },
    { label: 'Active Traders', value: 15000, suffix: '+', prefix: '' },
    { label: 'Uptime', value: 99.9, suffix: '%', prefix: '' },
  ]

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Execute trades in ≤ 1 block with our optimized infrastructure'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Attention-Based',
      description: 'Trade on social media attention scores powered by Chainlink oracles'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Reliable',
      description: 'Built on proven blockchain technology with 99.9% uptime'
    }
  ]

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
      {/* Background Beams */}
      <BackgroundBeams className="absolute inset-0 opacity-30" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(126, 231, 135, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(126, 231, 135, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 axiom-container py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">The Gateway to </span>
              <span className="bg-gradient-to-r from-axMint via-[#9CF6EE] to-axViolet bg-[length:200%] bg-clip-text text-transparent animate-hue duration-[8s] ease-linear infinite">
                DeFi
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Axiom is the only trading platform you'll ever need.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.button
              onClick={handleStartTrading}
              className={cn(
                "axiom-button px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 group relative overflow-hidden",
                buttonVariants.primary
              )}
              whileHover={{ 
                scale: 1.05, 
                y: -2, 
                x: 2,
                boxShadow: "0 20px 25px -5px rgba(126, 231, 135, 0.3), 0 10px 10px -5px rgba(126, 231, 135, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Start Trading</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-500 -skew-x-12" />
            </motion.button>
            
            <motion.button
              className={cn(
                "axiom-button px-8 py-4 rounded-lg font-semibold text-lg relative overflow-hidden group",
                "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-[#7EE787] hover:to-[#5BC465]",
                "bg-[length:200%] hover:bg-right transition-all duration-300",
                buttonVariants.secondary
              )}
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                x: 2,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 group-hover:text-black transition-colors">Learn More</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-500 -skew-x-12" />
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          >
            {stats.map((stat, index) => (
                             <motion.div
                 key={stat.label}
                 className="text-center"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
               >
                 <motion.div 
                   className="text-3xl md:text-4xl font-bold text-axMint mb-2 drop-shadow-[0_0_12px_rgba(126,231,135,0.25)] hover:drop-shadow-[0_0_18px_rgba(126,231,135,0.45)] transition-all"
                   whileHover={{ scale: 1.05 }}
                 >
                   {stat.prefix}
                   <CountUp
                     start={0}
                     end={stat.value}
                     duration={2}
                     delay={0.5 + index * 0.1}
                     decimals={stat.label === 'Uptime' ? 1 : 0}
                   />
                   {stat.suffix}
                 </motion.div>
                 <div className="text-gray-400 font-medium">{stat.label}</div>
               </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-card p-6 rounded-xl text-center group hover:border-[#7EE787]/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-[#7EE787] mb-4 flex justify-center group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-[#7EE787]/10 blur-xl"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-[#7EE787]/5 blur-2xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </div>
  )
} 