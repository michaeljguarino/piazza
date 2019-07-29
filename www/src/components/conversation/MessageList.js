import React, { Component } from 'react'
import Message from './Message'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import Scroller from '../Scroller'
import Loading from '../utils/Loading'

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
              id
              name
              handle
              backgroundColor
              bot
            }
            embed {
              type
              url
              image_url
              title
              description
              width
              height
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
        id
        name
        handle
        backgroundColor
        bot
      }
      embed {
        type
        url
        title
        image_url
        description
        width
        height
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
          if (loading) return <Loading />
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
                height: 'calc(100vh - 135px)',
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'column-reverse',
                padTop: '5px'
              }}
              mapper={(edge, prev) => <Message key={edge.node.id} message={edge.node} prev={prev.node} />}
              onLoadMore={() => {
                if (!pageInfo.hasNextPage) {
                  return
                }
                fetchMore({
                  variables: {conversationId: this.props.conversation.id, cursor: pageInfo.endCursor},
                  updateQuery: (prev, {fetchMoreResult}) => {
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