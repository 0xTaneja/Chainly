import { useMemo } from 'react'
import { useFuturesEvents } from '@/hooks/useFuturesEvents'

export function useOpenInterest(token: string) {
  const { opens } = useFuturesEvents()

  return useMemo(() => {
    const filtered = opens.filter(o => o.token === token)
    let long = 0, short = 0
    filtered.forEach(o => {
      const collateralEth = Number(o.collateral) / 1e18
      const size = collateralEth * Number(o.leverage)
      if (o.isLong) long += size; else short += size
    })
    return { long, short, total: long + short }
  }, [opens, token])
} 