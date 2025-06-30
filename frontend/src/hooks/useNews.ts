import { useEffect, useState } from 'react'

export interface NewsItem {
  title: string
  url: string
  source: string
  timestamp: string
  sentiment: 'positive' | 'neutral' | 'negative'
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news/all')
        const json = await res.json()
        setNews(json)
      } catch (e) {
        console.error('news fetch failed', e)
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
    const id = setInterval(fetchNews, 3 * 60 * 1000) // refresh every 3 min
    return () => clearInterval(id)
  }, [])

  const latest = news[0]

  return { news, latest, loading }
} 