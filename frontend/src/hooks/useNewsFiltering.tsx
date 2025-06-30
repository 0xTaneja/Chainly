import { useMemo } from 'react'
import { NewsItemProps } from '@/components/news/NewsItem'

export function useNewsFiltering(allNews: NewsItemProps[], activeTab: string) {
  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'bullish':
        return allNews.filter((n) => n.sentiment === 'positive')
      case 'bearish':
        return allNews.filter((n) => n.sentiment === 'negative')
      default:
        return allNews
    }
  }, [allNews, activeTab])

  return filtered
} 