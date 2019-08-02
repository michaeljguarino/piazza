import React, { Component } from 'react'
import Message from './Message'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import Scroller from '../Scroller'
import Loading from '../utils/Loading'
import {mergeAppend} from '../../utils/array'
import SubscriptionWrapper from '../utils/SubscriptionWrapper'

const MESSAGES_Q = gql`
  query ConversationQuery($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      messages(first: 100, after: $cursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id
            text
            insertedAt
            entities {
              type
              startIndex
              length
              user {
                id
                name
                handle
                backgroundColor
                avatar
              }
            }
            creator {
              id
              name
              handle
              backgroundColor
              bot
              avatar
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
        avatar
      }
      entities {
        type
        startIndex
        length
        user {
          id
          name
          handle
          backgroundColor
          avatar
        }
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
    return subscribeToMore({
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
      <Query query={MESSAGES_Q} variables={{conversationId: this.props.conversation.id}} fetchPolicy='cache-and-network'>
        {({loading, error, data, fetchMore, subscribeToMore}) => {
          if (loading) return <Loading />
          if (error) return <div>wtf</div>
          let messageEdges = data.conversation.messages.edges
          let pageInfo = data.conversation.messages.pageInfo
          return (
            <SubscriptionWrapper id={this.props.conversation.id} startSubscription={() => {
              return this._subscribeToNewMessages(subscribeToMore)
            }}>
              <Scroller
                id='message-viewport'
                edges={messageEdges}
                direction='up'
                style={{
                  overflow: 'auto',
                  height: 'calc(100vh - 145px)',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  flexDirection: 'column-reverse',
                  padTop: '5px'
                }}
                mapper={(edge, next) => <Message key={edge.node.id} message={edge.node} next={next.node} />}
                onLoadMore={() => {
                  if (!pageInfo.hasNextPage) {
                    return
                  }
                  fetchMore({
                    variables: {conversationId: this.props.conversation.id, cursor: pageInfo.endCursor},
                    updateQuery: (prev, {fetchMoreResult}) => {
                      const edges = fetchMoreResult.conversation.messages.edges
                      const pageInfo = fetchMoreResult.conversation.messages.pageInfo
                      return edges.length ? {
                        conversation: {
                          messages: {
                            __typename: prev.conversation.messages.__typename,
                            edges: mergeAppend(edges, prev.conversation.messages.edges, (e) => e.node.id),
                            pageInfo
                          },
                          ...this.props.conversation
                        }
                      } : prev;
                    }
                  })
                }}
              />
            </SubscriptionWrapper>
          )
        }}
      </Query>
    )
  }
}

export default MessageList