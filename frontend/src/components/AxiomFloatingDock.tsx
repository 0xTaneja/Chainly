'use client'

import React from 'react'
import { FloatingDock } from './ui/floating-dock'
import { Home, TrendingUp, Wallet, Settings, HelpCircle, Github } from 'lucide-react'

interface AxiomFloatingDockProps {
  currentView: 'dashboard' | 'trade' | 'positions'
  setCurrentView: (view: 'dashboard' | 'trade' | 'positions') => void
}

export default function AxiomFloatingDock({ currentView, setCurrentView }: AxiomFloatingDockProps) {
  const dockItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-full w-full text-axMint" />,
      href: "#dashboard",
    },
    {
      title: "Trade",
      icon: <TrendingUp className="h-full w-full text-axMint" />,
      href: "#trade",
    },
    {
      title: "Positions", 
      icon: <Wallet className="h-full w-full text-axMint" />,
      href: "#positions",
    },
    {
      title: "Settings",
      icon: <Settings className="h-full w-full text-axMint" />,
      href: "#settings",
    },
    {
      title: "Help",
      icon: <HelpCircle className="h-full w-full text-axMint" />,
      href: "#help",
    },
    {
      title: "GitHub",
      icon: <Github className="h-full w-full text-axMint" />,
      href: "https://github.com",
    },
  ]

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      <FloatingDock
        items={dockItems}
        desktopClassName="hidden md:flex"
        mobileClassName="flex md:hidden"
      />
    </div>
  )
} 