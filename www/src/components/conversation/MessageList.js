import React, { Component } from 'react'
import Message from './Message'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const MESSAGES_Q = gql`
  query ConversationQuery($conversationId: ID!) {
    conversation(id: $conversationId) {
      id
      messages(first: 20) {
        edges {
          node {
            id
            text
            insertedAt
            creator {
              name
            }
          }
        }
      }
    }
  }
`
const NEW_MESSAGES_SUB = gql`
  subscription NewMessages($convId: ID!) {
    newMessages(conversationId: $convId) {
      id
      text
      creator {
        name
      }
    }
  }
`;

class MessageList extends Component {
  _subscribeToNewMessages = async (subscribeToMore) => {
    subscribeToMore({
      document: NEW_MESSAGES_SUB,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newMessage = subscriptionData.data.newMessages
        const messages = prev.conversation.messages.edges
        const exists = messages.find(({ id }) => id === newMessage.id);
        if (exists) return prev;

        return Object.assign({}, prev, {
          conversation: {
            ...prev.conversation,
            messages: {
              ...prev.conversation.messages,
              edges: [newMessage, ...messages],
            }
          }
        })
      }
    })
  }

  render() {
    return (
      <div>
        <Query query={MESSAGES_Q} variables={{conversationId: this.props.conversation.id}}>
          {({loading, error, data, subscribeToMore}) => {
            if (loading) return <div>loading...</div>
            if (error) return <div>wtf</div>
            this._subscribeToNewMessages(subscribeToMore)
            return (<div>
              {data.conversation.messages.edges.map(edge => <Message key={edge.node.id} message={edge.node} />)}
            </div>)
          }}
        </Query>
      </div>
    )
  }
}

export default MessageList