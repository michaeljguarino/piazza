import React, { Component } from 'react'
import Message from './Message'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { isLoggedIn } from '../../helpers/authentication'

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
    if (!isLoggedIn()) {
      this.props.history.push('/login')
    }

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