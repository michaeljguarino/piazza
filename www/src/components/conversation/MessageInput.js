import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import {TextInput, Box, Form, Text} from 'grommet'

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
    hover: false
  }

  render() {
    const { text, hover } = this.state
    return (
      <Box fill='horizontal' pad='10px'>
        <Mutation mutation={MESSAGE_MUTATION} variables={{ conversationId: this.props.conversation.id, text }}>
          {postMutation => (
            <Form onSubmit={postMutation}>
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
                <Box
                  background={hover ? '#001a0c' : '#004d23'}
                  direction="row"
                  align="center"
                  justify="center"
                  style={{cursor: "pointer"}}
                  width="100px"
                  height="40px"
                  onMouseOver={() => this.setState({hover: true})}
                  onMouseOut={() => this.setState({hover: false})}
                  onClick={postMutation}>
                  <Text size="medium">Send</Text>
                </Box>
              </Box>
            </Form>)}
        </Mutation>
      </Box>
    )
  }
}

export default MessageInput