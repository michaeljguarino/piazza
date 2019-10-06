import React, {useState} from 'react'
import {Mutation} from 'react-apollo'
import {Box} from 'grommet'
import MentionManager from './MentionManager'
import Button, {SecondaryButton} from '../utils/Button'
import {EDIT_MESSAGE, MESSAGES_Q} from './queries'
import {updateMessage} from './utils'
import Plain from 'slate-plain-serializer'

function MessageEdit(props) {
  const [editorState, setEditorState] = useState(Plain.deserialize(props.message.text))
  return (
    <Mutation
      mutation={EDIT_MESSAGE}
      update={(cache, {data: {editMessage}}) => {
        const convId = props.message.conversationId
        const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: convId}})
        cache.writeQuery({
          query: MESSAGES_Q,
          variables: {conversationId: convId},
          data: updateMessage(data, editMessage)
        })
        props.setEditing(false)
      }}>
    {mutation => (
      <Box pad={{right: 'small'}} gap='xsmall'>
        <Box direction='row' fill='horizontal' round='xsmall' pad='xsmall' border>
          <MentionManager
            submitDisabled
            editorState={editorState}
            setEditorState={setEditorState}
            onChange={() => null}
            disableSubmit={() => null} />
        </Box>
        <Box direction='row' gap='xsmall'>
          <Button label='Update' round='xsmall' onClick={() => (
            mutation({variables: {id: props.message.id, attributes: {text: Plain.serialize(editorState)}}})
          )} />
          <SecondaryButton label='Cancel' round='xsmall' onClick={() => props.setEditing(false)} />
        </Box>
      </Box>
    )}
    </Mutation>
  )
}

export default MessageEdit