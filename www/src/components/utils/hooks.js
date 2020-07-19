import { useEffect, useMemo } from 'react'
import { withMentions } from './TypeaheadEditor'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { createEditor } from 'slate'

export function useSubscription(start, id) {
  useEffect(() => {
    console.log(`subscribing to ${id}`)
    const unsubscribe = start()

    return () => {
      console.log(`unsubscribing to ${id}`)
      unsubscribe()
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
}

export function useEditor() {
  return useMemo(() => withMentions(withReact(withHistory(createEditor()))), [])
}