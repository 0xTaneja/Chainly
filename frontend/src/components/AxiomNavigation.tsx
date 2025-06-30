'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, X, ExternalLink, Sun, Moon } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { useThemeMode } from '@/providers/Theme'

interface NavigationProps {
  currentView: 'dashboard' | 'markets' | 'trade' | 'positions'
  setCurrentView: (view: 'dashboard' | 'markets' | 'trade' | 'positions') => void
}

export default function AxiomNavigation({ currentView, setCurrentView }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { theme, toggle } = useThemeMode()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= 24)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'trade' as const, label: 'Trade' },
    { id: 'markets' as const, label: 'Markets' },
    { id: 'positions' as const, label: 'Positions' },
    { id: 'oracles' as const, label: 'Live Oracles', isExternal: true, route: '/oracles' },
  ]

  return (
    <>
      <motion.nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-axBlack border-b border-white/10",
          isScrolled ? "shadow-sm" : ""
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="w-full px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 ">
            
            {/* Logo */}
            <motion.div 
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentView('dashboard')}
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-axMint via-[#9CF6EE] to-axViolet bg-clip-text text-transparent">
                Chainly
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    if (item.isExternal && item.route) {
                      window.location.href = item.route
                    } else {
                      setCurrentView(item.id as 'trade' | 'positions' | 'markets')
                    }
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group focus-visible:ring-2 focus-visible:ring-axMint/60 focus-visible:ring-offset-2 focus-visible:ring-offset-axBlack focus-visible:outline-none",
                    currentView === item.id
                      ? "text-axMint"
                      : "text-gray-300 hover:text-white after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-axMint"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {item.label}
                    {item.isExternal && <ExternalLink size={14} />}
                  </span>
                  
                  {/* Hover underline */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-axMint origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.12 }}
                  />
                  
                  {/* Active indicator */}
                  {currentView === item.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-axMint"
                      layoutId="activeTab"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            


            {/* Theme toggle & connect (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggle}
                className="p-2 text-gray-400 hover:text-white"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="axiom-button">
                <ConnectButton />
              </div>
            </div>

            {/* Mobile icons */}
            <div className="md:hidden flex items-center gap-1">
              <button onClick={toggle} className="p-2 text-gray-400 hover:text-white" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                className="p-2 text-white hover:text-[#7EE787] transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dialog */}
      <Dialog.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50" />
          <Dialog.Content className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-[#101010] border-l border-[#262626] z-50 p-6">
            <div className="flex justify-between items-center mb-8">
              <Dialog.Title className="text-xl font-bold gradient-text">
                Menu
              </Dialog.Title>
              <Dialog.Close className="p-2 text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    if (item.isExternal && item.route) {
                      window.location.href = item.route
                    } else {
                      setCurrentView(item.id as 'trade' | 'positions' | 'markets')
                    }
                    setIsMobileMenuOpen(false)
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
                    currentView === item.id
                      ? "bg-[#7EE787]/10 text-[#7EE787] border border-[#7EE787]/20"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  {item.isExternal && <ExternalLink size={16} />}
                </motion.button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-[#262626]">
              <ConnectButton />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
} 