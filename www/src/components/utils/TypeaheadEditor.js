import React, { useCallback, useRef, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Editor, Transforms, Range } from 'slate'
import {
  Slate,
  Editable,
  ReactEditor,
  useSelected,
  useFocused,
} from 'slate-react'
import { StandardEmoji, CustomEmoji } from '../messages/Message'


function Portal({children}) {
  return ReactDOM.createPortal(children, document.body)
}

export default function TypeaheadEditor({editor, value, setValue, style, onOpen, searchQuery, handlers}) {
  const ref = useRef()
  const [target, setTarget] = useState(null)
  const [index, setIndex] = useState(0)
  const [suggestions, setSuggestions] = useState([])
  const renderElement = useCallback(props => <Element {...props} />, [])

  const onKeyDown = useCallback(
    event => {
      if (target) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            const prevIndex = index >= suggestions.length - 1 ? 0 : index + 1
            setIndex(prevIndex)
            break
          case 'ArrowUp':
            event.preventDefault()
            const nextIndex = index <= 0 ? suggestions.length - 1 : index - 1
            setIndex(nextIndex)
            break
          case 'Tab':
          case 'Enter':
            if (target === null || suggestions.length === 0) break
            event.preventDefault()
            Transforms.select(editor, target)
            insertMention(editor, suggestions[index].value)
            setTarget(null)
            break
          case 'Escape':
            event.preventDefault()
            setTarget(null)
            break
          default:
            // ignore
        }
      }
    },
// eslint-disable-next-line react-hooks/exhaustive-deps
    [index, suggestions, target]
  )

  useEffect(() => {
    if (target && suggestions.length > 0) {
      const el = ref.current
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      el.style.top = `${rect.top + window.pageYOffset - 16 - el.clientHeight}px`
      el.style.left = `${rect.left + window.pageXOffset}px`
    }
  }, [suggestions, editor, index, target])

  // useEffect(() => {
  //   if (editorRef && editorRef.current) {
  //     editorRef.focus()
  //   }
  // }, [editorRef])

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={value => {
        setValue(value)
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection)
          const wordBefore = Editor.before(editor, start, { unit: 'word' })
          const before = wordBefore && Editor.before(editor, wordBefore)
          const beforeRange = before && Editor.range(editor, before, start)
          const beforeText = beforeRange && Editor.string(editor, beforeRange)
          const after = Editor.after(editor, start)
          const afterRange = Editor.range(editor, start, after)
          const afterText = Editor.string(editor, afterRange)
          const afterMatch = afterText.match(/^(\s|$)/)

          for (const {trigger, begin, suggestions} of handlers) {
            if (begin && (!wordBefore || wordBefore.offset > 1)) continue

            const beforeMatch = beforeText && beforeText.match(trigger)
            if (beforeMatch && afterMatch) {
              setTarget(beforeRange)
              onOpen(true)
              searchQuery(beforeMatch[1], suggestions).then(setSuggestions)
              setIndex(0)
              return
            }
          }
        }

        onOpen(false)
        setTarget(null)
      }}
    >
      <Editable
        autoFocus
        renderElement={renderElement}
        style={style}
        onKeyDown={onKeyDown}
        placeholder="This is for talking..."
      />
      {target && suggestions.length > 0 && (
        <Portal>
          <div
            ref={ref}
            style={{
              top: '-9999px',
              left: '-9999px',
              position: 'absolute',
              zIndex: 1,
              background: 'white',
              borderRadius: '4px',
              boxShadow: '0 1px 5px rgba(0,0,0,.2)',
            }}
          >
            {suggestions.map(({key, suggestion}, i) => (
              <div
                key={key}
                style={{
                  padding: '3px 3px',
                  borderRadius: '3px',
                  background: i === index ? '#EDEDED' : 'transparent',
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </Slate>
  )
}

export const withMentions = editor => {
  const { isInline, isVoid } = editor

  editor.isInline = element => {
    return ['mention', 'emoji'].includes(element.type) ? true : isInline(element)
  }

  editor.isVoid = element => {
    return ['mention', 'emoji'].includes(element.type) ? true : isVoid(element)
  }

  return editor
}

const insertMention = (editor, val) => {
  const mention = val.type ? val : { text: val + ' ' }
  Transforms.insertNodes(editor, mention)
  Transforms.move(editor)
}

const Element = props => {
  const { attributes, children, element } = props

  switch (element.type) {
    case 'mention':
      return <MentionElement {...props} />
    case 'emoji':
      if (element.emoji.imageUrl) return <CustomEmoji emoji={element.emoji} size={16} />
      return <StandardEmoji name={element.emoji.name} size={16} />
    default:
      return <div {...attributes}>{children}</div>
  }
}

const MentionElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const focused = useFocused()
  return (
    <span
      {...attributes}
      contentEditable={false}
      style={{
        padding: '3px 3px 2px',
        margin: '0 1px',
        verticalAlign: 'baseline',
        display: 'inline-block',
        borderRadius: '4px',
        backgroundColor: '#eee',
        fontSize: '0.9em',
        boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
      }}
    >
      @{element.name}
      {children}
    </span>
  )
}