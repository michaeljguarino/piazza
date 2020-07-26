import { useMemo } from 'react'
import { withMentions } from './TypeaheadEditor'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { createEditor } from 'slate'

export function useEditor() {
  return useMemo(() => withMentions(withReact(withHistory(createEditor()))), [])
}