'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqData = [
  {
    question: "What is Chainly?",
    answer: "Chainly is the world's first attention derivatives platform. Instead of trading token prices, you trade social media attention and viral trends. Go long on PEPE mentions, short DOGE hype, or trade attention futures across Twitter, Reddit, and Farcaster using Chainlink oracles."
  },
  {
    question: "How does attention trading work?",
    answer: "Attention trading lets you speculate on social media buzz before price moves. For example, you can buy a 24-hour attention contract betting that PEPE will get 5x more mentions. Chainlink Functions fetch real-time data from social platforms, and contracts settle automatically based on actual attention metrics."
  },
  {
    question: "What social platforms does Chainly track?",
    answer: "Chainly monitors Twitter, Reddit, Farcaster, GitHub stars, and CryptoCompare mentions through Chainlink Functions. Our oracles aggregate attention data from multiple sources to create reliable attention scores for each token."
  },
  {
    question: "What types of attention derivatives can I trade?",
    answer: "Chainly offers Attention Futures (24h, 48h, 7d contracts), Attention Index Options (bet on average attention across top tokens), Leveraged Attention Tokens (3x exposure like PEPE3XATTN), and Inverse Attention Tokens for shorting viral trends."
  },
  {
    question: "Why trade attention instead of price?",
    answer: "Attention precedes price movement. By trading social buzz and viral trends, you can front-run price movements before the market reacts. When a meme coin starts trending on Twitter, you can profit from the attention surge before traders pile in and pump the price."
  }
]

export default function AxiomFAQ() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <motion.section 
      ref={containerRef} 
      className="py-12 pb-12 bg-axBlack relative"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7EE787]/5 to-transparent" />
      
      <div className="axiom-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-11"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Frequently Asked </span>
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to know about Chainly and attention derivatives
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Accordion.Item 
                  value={`item-${index}`}
                  className="glass-card rounded-xl overflow-hidden group hover:border-[#7EE787]/30 transition-all duration-300"
                >
                  <Accordion.Trigger className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors group-data-[state=open]:bg-white/5">
                    <span className="text-lg font-semibold text-white pr-4">
                      {item.question}
                    </span>
                    <motion.div
                      className="text-[#7EE787]"
                      animate={{ rotate: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ 
                          rotate: 0,
                          opacity: 1
                        }}
                        className="group-data-[state=open]:rotate-180 transition-transform duration-180"
                      >
                        <Plus className="w-5 h-5 group-data-[state=open]:hidden" />
                        <Minus className="w-5 h-5 hidden group-data-[state=open]:block" />
                      </motion.div>
                    </motion.div>
                  </Accordion.Trigger>
                  
                  <Accordion.Content className="px-6 pb-6 text-gray-300 leading-relaxed data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden transition-all duration-180 ease-out" aria-expanded="false" aria-controls={`content-${index}`}>
                    <div className="pt-2">
                      {item.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </motion.div>
            ))}
          </Accordion.Root>
        </motion.div>


      </div>
    </motion.section>
  )
}

// Add custom CSS for accordion animations (you might need to add this to globals.css)
const accordionStyles = `
@keyframes accordion-down {
  from { height: 0 }
  to { height: var(--radix-accordion-content-height) }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height) }
  to { height: 0 }
}

.animate-accordion-down {
  animation: accordion-down 0.2s ease-out;
}

.animate-accordion-up {
  animation: accordion-up 0.2s ease-out;
}
` 