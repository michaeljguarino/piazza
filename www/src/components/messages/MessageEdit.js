import React, {useState} from 'react'
import {useMutation} from 'react-apollo'
import {Box} from 'grommet'
import MentionManager from './MentionManager'
import Button, {SecondaryButton} from '../utils/Button'
import {EDIT_MESSAGE, MESSAGES_Q} from './queries'
import {updateMessage} from './utils'
import {plainDeserialize, plainSerialize} from '../../utils/slate'
import { useEditor } from '../utils/hooks'

function MessageEdit(props) {
  const [editorState, setEditorState] = useState(plainDeserialize(props.message.text))
  const editor = useEditor()
  const [mutation] = useMutation(EDIT_MESSAGE, {
    update: (cache, {data: {editMessage}}) => {
      const convId = props.message.conversationId
      const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: convId}})
      cache.writeQuery({
        query: MESSAGES_Q,
        variables: {conversationId: convId},
        data: updateMessage(data, editMessage)
      })
      props.setEditing(false)
    }
  })

  return (
    <Box pad={{right: 'small'}} gap='xsmall'>
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
        <Button label='Update' round='xsmall' onClick={() => (
          mutation({variables: {id: props.message.id, attributes: {text: plainSerialize(editorState)}}})
        )} />
        <SecondaryButton label='Cancel' round='xsmall' onClick={() => props.setEditing(false)} />
      </Box>
    </Box>
  )
}

export default MessageEdit