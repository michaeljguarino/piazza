import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import {TextInput, Box, Form} from 'grommet'

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
      <Box fill='horizontal' pad='10px'>
        <Mutation mutation={MESSAGE_MUTATION} variables={{ conversationId: this.props.conversation.id, text }}>
          {postMutation => (
            <Form onSubmit={postMutation}>
              <Box
                fill='horizontal'
                direction="row"
                align="center"
                justify="right"
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
                <Box
                  background='accent-1'
                  direction="row"
                  align="center"
                  justify="center"
                  style={{cursor: "pointer"}}
                  width="100px"
                  height="40px"
                  onClick={postMutation}>
                  Send
                </Box>
              </Box>
            </Form>)}
        </Mutation>
      </Box>
    )
  }
}

export default MessageInput