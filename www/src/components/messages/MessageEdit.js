import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useMutation } from 'react-apollo'
import { Keyboard } from 'grommet'
import { Return } from 'grommet-icons'
import { Button, SecondaryButton } from 'forge-core'
import { Box } from 'grommet'
import MentionManager from './MentionManager'
import { EDIT_MESSAGE, MESSAGES_Q } from './queries'
import { updateMessage } from './utils'
import { plainDeserialize, plainSerialize } from '../../utils/slate'
import { useEditor } from '../utils/hooks'
import { ReactEditor } from 'slate-react'
import { Transforms, Editor } from 'slate'

function MessageEdit({setSize, message, setEditing, ...props}) {
  const editRef = useRef()
  const [editorState, setEditorState] = useState(plainDeserialize(message.text))
  const editor = useEditor()
  const [mutation] = useMutation(EDIT_MESSAGE, {
    update: (cache, {data: {editMessage}}) => {
      const convId = message.conversationId
      const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: convId}})
      cache.writeQuery({
        query: MESSAGES_Q,
        variables: {conversationId: convId},
        data: updateMessage(data, editMessage)
      })
    },
    onCompleted: () => {
      setEditing(false)
      setSize()
    }
  })

  useEffect(() => {
    setSize()
    ReactEditor.focus(editor)
    // Transforms.select(editor, Editor.end(editor, []))
    return () => editRef && setSize()
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRef])

  const send = useCallback(() => (
    mutation({variables: {id: message.id, attributes: {text: plainSerialize(editorState)}}})
  ), [mutation, message, editorState])

  return (
    <Box ref={editRef} pad={{right: 'small'}} gap='xsmall'>
      <Keyboard onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          send()
          e.preventDefault()
        }
      }}>
        <Box direction='row' fill='horizontal' round='xsmall' background='white' border>
          <MentionManager
            submitDisabled
            editor={editor}
            editorState={editorState}
            setEditorState={setEditorState}
            onChange={() => null}
            disableSubmit={() => null} />
        </Box>
      </Keyboard>
      <Box direction='row' gap='xsmall'>
        <SecondaryButton label='cancel' round='xsmall' onClick={() => setEditing(false)} />
        <Button icon={<Return size='small' />} label='update' round='xsmall' onClick={send} />
      </Box>
    </Box>
  )
}

export default MessageEdit