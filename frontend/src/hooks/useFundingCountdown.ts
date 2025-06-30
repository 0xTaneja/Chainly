import { useEffect, useState } from 'react'

export function useFundingCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(() => calc())

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  function calc() {
    const now = Date.now()
    const nextHour = Math.ceil(now / 3600000) * 3600000
    return Math.max(0, Math.floor((nextHour - now) / 1000))
  }

  return secondsLeft
} 