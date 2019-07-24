import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

const MESSAGE_MUTATION = gql`
  mutation CreateMessage($conversationId: ID!, $text: String!) {
    createMessage(
      conversationId: $conversationId,
      attributes: {text: $text}) {
      id
      text
      insertedAt
      user {
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
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={text}
            onChange={e => this.setState({ text: e.target.value })}
            type="text"
            placeholder="Whatever is on your mind"
          />
        </div>
        <Mutation mutation={POST_MUTATION} variables={{ conversationId: '1', text }}>
          {postMutation => (
            <button onClick={postMutation}>
              Submit
            </button>
          )}
        </Mutation>
      </div>
    )
  }
}

export default CreateLink