import React, { Component } from 'react'
import Message from './Message'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import Scroller from '../Scroller'

const MESSAGES_Q = gql`
  query ConversationQuery($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      messages(first: 25, after: $cursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id
            text
            insertedAt
            creator {
              name
              handle
              backgroundColor
            }
          }
        }
      }
    }
  }
`
const NEW_MESSAGES_SUB = gql`
  subscription NewMessages($conversationId: ID!) {
    newMessages(conversationId: $conversationId) {
      id
      text
      insertedAt
      creator {
        name
        handle
        backgroundColor
      }
    }
  }
`;

class MessageList extends Component {
  _subscribeToNewMessages = async (subscribeToMore) => {
    subscribeToMore({
      document: NEW_MESSAGES_SUB,
      variables: {conversationId: this.props.conversation.id},
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newMessage = subscriptionData.data.newMessages
        const messages = prev.conversation.messages.edges
        const exists = messages.find((edge) => edge.node.id === newMessage.id);
        if (exists) return prev;

        let newMessageNode = {node: newMessage, __typename: "MessageEdge"}
        return Object.assign({}, prev, {
          conversation: {
            ...prev.conversation,
            messages: {
              ...prev.conversation.messages,
              edges: [newMessageNode, ...messages],
            }
          }
        })
      }
    })
  }

  render() {
    return (
      <Query query={MESSAGES_Q} variables={{conversationId: this.props.conversation.id}}>
        {({loading, error, data, fetchMore, subscribeToMore}) => {
          if (loading) return <div>loading...</div>
          if (error) return <div>wtf</div>
          this._subscribeToNewMessages(subscribeToMore)
          let messageEdges = data.conversation.messages.edges
          let pageInfo = data.conversation.messages.pageInfo
          return (
            <Scroller
              id='message-viewport'
              edges={messageEdges}
              direction='up'
              style={{
                overflow: 'auto',
                height: 'calc(100vh - 125px)',
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'column-reverse',
                padTop: '5px'
              }}
              mapper={(edge) => <Message key={edge.node.id} message={edge.node} />}
              onLoadMore={() => {
                if (!pageInfo.hasNextPage) {
                  return
                }
                fetchMore({
                  variables: {conversationId: this.props.conversation.id, cursor: pageInfo.endCursor},
                  updateQuery: (prev, {fetchMoreResult}) => {
                    console.log(fetchMoreResult)
                    const edges = fetchMoreResult.conversation.messages.edges
                    const pageInfo = fetchMoreResult.conversation.messages.pageInfo
                    if (messageEdges.find((edge) => edge.node.id === edges[0].node.id)) {
                      return prev;
                    }
                    return edges.length ? {
                      conversation: {
                        messages: {
                          __typename: prev.conversation.__typename,
                          edges: [...prev.conversation.messages.edges, ...edges],
                          pageInfo
                        },
                        ...this.props.conversation
                      }
                    } : prev;
                  }
                })
              }}
            />
          )
        }}
      </Query>
    )
  }
}

export default MessageList