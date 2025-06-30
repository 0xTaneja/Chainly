'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Github, Twitter, MessageCircle, FileText, ExternalLink } from 'lucide-react'

interface FooterLink {
  name: string
  href: string
  icon?: React.ReactNode
}

export default function AxiomFooter() {
  const footerLinks: Record<string, FooterLink[]> = {
    product: [
      { name: 'Dashboard', href: '#dashboard' },
      { name: 'Trading', href: '#trade' },
      { name: 'Positions', href: '#positions' },
      { name: 'Analytics', href: '#analytics' },
    ],
    resources: [
      { name: 'Documentation', href: '#docs', icon: <FileText className="w-4 h-4" /> },
      { name: 'API Reference', href: '#api', icon: undefined },
      { name: 'Tutorials', href: '#tutorials', icon: undefined },
      { name: 'FAQ', href: '#faq', icon: undefined },
    ],
    community: [
      { name: 'Discord', href: '#discord', icon: <MessageCircle className="w-4 h-4" /> },
      { name: 'Twitter', href: '#twitter', icon: <Twitter className="w-4 h-4" /> },
      { name: 'GitHub', href: '#github', icon: <Github className="w-4 h-4" /> },
      { name: 'Blog', href: '#blog', icon: undefined },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy', icon: undefined },
      { name: 'Terms of Service', href: '#terms', icon: undefined },
      { name: 'Cookie Policy', href: '#cookies', icon: undefined },
      { name: 'Disclaimer', href: '#disclaimer', icon: undefined },
    ]
  }

  const socialLinks = [
    { 
      name: 'Twitter', 
      href: '#twitter', 
      icon: <Twitter className="w-5 h-5" />,
      hoverColor: 'hover:text-blue-400'
    },
    { 
      name: 'Discord', 
      href: '#discord', 
      icon: <MessageCircle className="w-5 h-5" />,
      hoverColor: 'hover:text-indigo-400'
    },
    { 
      name: 'GitHub', 
      href: '#github', 
      icon: <Github className="w-5 h-5" />,
      hoverColor: 'hover:text-gray-300'
    },
  ]

  return (
    <motion.footer 
      className="bg-axBlack border-t border-axOverlay relative"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(126, 231, 135, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(126, 231, 135, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      <div className="axiom-container relative z-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-x-8 mb-12">
          {/* Logo and Description */}
          <div className="md:col-span-2 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <div className="text-2xl font-bold gradient-text">
                  AttentionFutures
                </div>
              </div>
              
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                The only trading platform you'll ever need for attention-based derivatives. 
                Trade with confidence using real-time social media attention scores.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className={`p-2 rounded-lg bg-[#262626] text-gray-400 transition-all duration-200 ${social.hoverColor} hover:bg-[#404040] hover:scale-110 focus-visible:ring-2 focus-visible:ring-green-400/60 focus-visible:outline-none`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4 capitalize">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: linkIndex * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[#7EE787] transition-colors duration-200 flex items-center gap-2 group"
                    >
                      {link.icon}
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="text-gray-400 text-sm">
            © 2024 AttentionFutures. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-400">Built with</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#7EE787] rounded-full animate-pulse" />
              <span className="text-[#7EE787] font-semibold">Chainlink</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-[#7EE787]/5 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-10 right-20 w-8 h-8 rounded-full bg-[#7EE787]/10 blur-lg"
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </motion.footer>
  )
} 