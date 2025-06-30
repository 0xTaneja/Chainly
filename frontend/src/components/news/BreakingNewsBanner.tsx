import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNews } from '@/hooks/useNews'

export default function BreakingNewsBanner() {
  const { latest } = useNews()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (latest) {
      setShow(true)
      const t = setTimeout(() => setShow(false), 10000)
      return () => clearTimeout(t)
    }
  }, [latest])

  if (!show) return null

  return (
    <div className="bg-red-900/80 border border-red-700 text-white px-4 py-2 flex items-center justify-between animate-fade-in">
      <div className="flex items-center">
        <Bell size={16} className="mr-2 animate-pulse" />
        <span className="text-sm font-medium">{latest?.title}</span>
      </div>
      <button onClick={() => setShow(false)} className="text-white/70 hover:text-white ml-2">
        ✕
      </button>
    </div>
  )
} 