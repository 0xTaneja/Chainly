import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'
import NewsFilters from './NewsFilters'
import NewsContainer from './NewsContainer'
import { useNewsFiltering } from '@/hooks/useNewsFiltering'
import { useNews } from '@/hooks/useNews'

export default function NewsFeed() {
  const [activeTab, setActiveTab] = useState('all')
  const { news, loading } = useNews()

  const filtered = useNewsFiltering(news as any, activeTab)

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <NewsFilters activeTab={activeTab} />
      </Tabs>
      {loading ? (
        <div className="p-4 text-gray-400 text-sm">Loading news…</div>
      ) : (
        <NewsContainer news={filtered} />
      )}
    </div>
  )
} 