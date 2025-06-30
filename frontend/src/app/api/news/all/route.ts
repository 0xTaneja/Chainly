import { NextResponse } from 'next/server'

const NEWS_ENDPOINT = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN'

export async function GET() {
  try {
    const res = await fetch(NEWS_ENDPOINT, { next: { revalidate: 120 } })
    if (!res.ok) {
      return NextResponse.json({ error: 'news fetch failed' }, { status: 500 })
    }
    const json = await res.json()
    const items = (json?.Data || []).map((it: any) => ({
      title: it.title,
      url: it.url,
      source: it.source,
      timestamp: it.published_on ? new Date(it.published_on * 1000).toISOString() : '',
      sentiment: (it.categories || '').toLowerCase().includes('bullish') ? 'positive' : (it.categories || '').toLowerCase().includes('bearish') ? 'negative' : 'neutral',
    }))
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: 'unexpected' }, { status: 500 })
  }
} 