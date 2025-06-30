'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AxiomNavigation from '@/components/AxiomNavigation'

export default function SiteNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  // derive initial view from current path
  const deriveView = (path: string): 'trade' | 'positions' | 'markets' => {
    if (path.startsWith('/positions')) return 'positions'
    if (path.startsWith('/markets')) return 'markets'
    return 'trade'
  }

  const [currentView, setCurrentView] = useState<'trade' | 'positions' | 'markets'>(deriveView(pathname))

  useEffect(() => {
    setCurrentView(deriveView(pathname))
  }, [pathname])

  const handleSetView = (view: 'trade' | 'positions' | 'markets') => {
    setCurrentView(view)
    // push corresponding route
    router.push(`/${view}`)
  }

  return <AxiomNavigation currentView={currentView} setCurrentView={handleSetView as any} />
} 