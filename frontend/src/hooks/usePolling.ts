import { useEffect, useRef } from 'react'

interface UsePollingOptions {
  interval?: number // milliseconds
  enabled?: boolean
}

export function usePolling(
  callback: () => void | Promise<void>,
  { interval = 5000, enabled = true }: UsePollingOptions = {}
) {
  const callbackRef = useRef(callback)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const tick = async () => {
      try {
        await callbackRef.current()
      } catch (error) {
        console.error('Polling callback error:', error)
      }
    }

    // Initial call
    tick()

    // Set up interval
    intervalRef.current = setInterval(tick, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [interval, enabled])

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startPolling = () => {
    if (!intervalRef.current && enabled) {
      const tick = async () => {
        try {
          await callbackRef.current()
        } catch (error) {
          console.error('Polling callback error:', error)
        }
      }
      
      tick()
      intervalRef.current = setInterval(tick, interval)
    }
  }

  return { stopPolling, startPolling }
} 