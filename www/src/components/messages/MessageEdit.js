import React, {useState} from 'react'
import {Mutation} from 'react-apollo'
import {Box} from 'grommet'
import MentionManager from './MentionManager'
import Button, {SecondaryButton} from '../utils/Button'
import {EDIT_MESSAGE, MESSAGES_Q} from './queries'
import {updateMessage} from './utils'

function MessageEdit(props) {
  const [text, setText] = useState(props.message.text)
  return (
    <Mutation
      mutation={EDIT_MESSAGE}
      variables={{id: props.message.id, attributes: {text: text}}}
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
      <Box pad='small' gap='xsmall'>
        <Box direction='row' fill='horizontal' round='xsmall' pad='xxsmall' border>
          <MentionManager
            submitDisabled
            text={text}
            setText={setText}
            onChange={() => null}
            disableSubmit={() => null} />
        </Box>
        <Box direction='row' gap='xsmall'>
          <Button label='Update' round='xsmall' onClick={mutation} />
          <SecondaryButton label='Cancel' round='xsmall' onClick={() => props.setEditing(false)} />
        </Box>
      </Box>
    )}
    </Mutation>
  )
}

export default MessageEdit