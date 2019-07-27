import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import {TextInput, Button, Box, } from 'grommet'
import {Edit} from 'grommet-icons'

const MESSAGE_MUTATION = gql`
  mutation CreateMessage($conversationId: ID!, $text: String!) {
    createMessage(
      conversationId: $conversationId,
      attributes: {text: $text}) {
      id
      text
      insertedAt
      creator {
        name
      }
    }
  }
`

class MessageInput extends Component {
  state = {
    text: '',
  }

  render() {
    const { text } = this.state
    return (
      <Box fill='horizontal' pad='small'>
        <Box
          fill='horizontal'
          direction="row"
          align="center"
          border
          round='xsmall'
        >
          <TextInput
            plain
            type='text'
            value={text}
            onChange={e => this.setState({ text: e.target.value })}
            placeholder="Whatever is on your mind"
          />
          <Mutation mutation={MESSAGE_MUTATION} variables={{ conversationId: this.props.conversation.id, text }}>
            {postMutation => (
              <Button
                icon={<Edit size='small' />}
                onClick={postMutation}
              />
            )}
          </Mutation>
        </Box>
      </Box>
    )
  }
}

export default MessageInput