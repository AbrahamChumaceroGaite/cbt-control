'use client'
import { useEffect, useRef } from 'react'

/**
 * Runs callback on a fixed interval.
 * delay=null pauses the interval without unmounting the component.
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  // Always call the latest version of the callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
