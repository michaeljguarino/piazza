import React, { useState, useContext, useEffect, useRef } from 'react'
import { useMutation } from 'react-apollo'
import { Return } from 'grommet-icons'
import { Box, Text } from 'grommet'
import MentionManager from './MentionManager'
import Button, {SecondaryButton} from '../utils/Button'
import {EDIT_MESSAGE, MESSAGES_Q} from './queries'
import {updateMessage} from './utils'
import {plainDeserialize, plainSerialize} from '../../utils/slate'
import { useEditor } from '../utils/hooks'

function MessageEdit({setSize, message, ...props}) {
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
      props.setEditing(false)
    }
  })

  useEffect(() => {
   setSize()
  }, [editRef])

  return (
    <Box ref={editRef} pad={{right: 'small'}} gap='xsmall'>
      <Box direction='row' fill='horizontal' round='xsmall' pad='xsmall' border>
        <MentionManager
          submitDisabled
          editor={editor}
          editorState={editorState}
          setEditorState={setEditorState}
          onChange={() => null}
          disableSubmit={() => null} />
      </Box>
      <Box direction='row' gap='xsmall'>
        <SecondaryButton label='cancel' round='xsmall' onClick={() => props.setEditing(false)} />
        <Button icon={<Return size='small' />} label='update' round='xsmall' onClick={() => (
          mutation({variables: {id: message.id, attributes: {text: plainSerialize(editorState)}}})
        )} />
      </Box>
    </Box>
  )
}

export default MessageEdit