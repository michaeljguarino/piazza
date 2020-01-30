import { useEffect } from 'react'

export function useSubscription(start, id) {
  useEffect(() => {
    console.log(`subscribing to ${id}`)
    const unsubscribe = start()

    return () => {
      console.log(`unsubscribing to ${id}`)
      unsubscribe()
    }
  }, [id])
}