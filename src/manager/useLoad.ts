import { useEffect, useState } from 'react'

/** Loads data for a component and exposes loading, error and reload. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[], initial: T) {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true)
    load()
      .then((value) => active && (setData(value), setError('')))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { data, setData, loading, error, reload: () => setTick((t) => t + 1) }
}
