import React, { Component } from 'react'
import Message from './Message'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const MESSAGES_Q = gql`
{
  conversation(name: "townhall") {
    messages(first: 20) {
      edges {
        node {
          id
          text
          insertedAt
          user {
            name
          }
        }
      }
    }
  }
}
`

class MessageList extends Component {
  render() {
    const messages = [{id: '1', text: 'A message', insertedAt: 'now', user: {name: 'Michael Guarino'}}]

    return (
      <Query query={MESSAGES_Q}>
        {({loading, error, data}) => {
          if (loading) return <div>loading...</div>
          if (error) return <div>wtf</div>

          return (<div>
            {data.conversation.messages.edges.map(edge => <Message key={edge.message.id} message={edge.message} />)}
          </div>)
        }}
      </Query>
    )
  }
}

export default MessageList