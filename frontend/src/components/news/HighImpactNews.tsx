import { Bell } from 'lucide-react'
import { useNews } from '@/hooks/useNews'

export default function HighImpactNews() {
  const { news, loading } = useNews()
  const highImpact = news.slice(0, 10)

  return (
    <>
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Bell size={14} className="mr-2" />
        High Impact News
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {loading && <p className="text-gray-400 text-sm">Loading…</p>}
        {!loading && highImpact.map((n) => (
          <a key={n.title} href={n.url} target="_blank" rel="noopener" className="block text-xs hover:underline text-white/90">
            • {n.title}
          </a>
        ))}
      </div>
    </>
  )
} 