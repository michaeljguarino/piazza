import React, { Component } from 'react'
import Message from './Message'
import { Query } from 'react-apollo'
import Scroller from '../utils/Scroller'
import Loading from '../utils/Loading'
import {mergeAppend} from '../../utils/array'
import SubscriptionWrapper from '../utils/SubscriptionWrapper'
import {MESSAGES_Q, NEW_MESSAGES_SUB} from './queries'
import {applyNewMessage, removeMessage} from './utils'

class MessageList extends Component {
  state = {
    loaded: false
  }
  _subscribeToNewMessages = async (subscribeToMore) => {
    return subscribeToMore({
      document: NEW_MESSAGES_SUB,
      variables: {conversationId: this.props.conversation.id},
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const messageDelta = subscriptionData.data.messageDelta
        const message = messageDelta.payload

        switch(messageDelta.delta) {
          case "CREATE":
            return applyNewMessage(prev, message)
          case "DELETE":
            return removeMessage(prev, message)
          default:
            return prev
        }
      }
    })
  }

  render() {
    return (
      <Query query={MESSAGES_Q} variables={{conversationId: this.props.conversation.id}} fetchPolicy='cache-and-network'>
        {({loading, error, data, fetchMore, subscribeToMore}) => {
          if (loading && !data.conversation) return <Loading height='calc(100vh - 135px)' width='100%' />
          if (error) return <div>wtf</div>
          let messageEdges = data.conversation.messages.edges
          let pageInfo = data.conversation.messages.pageInfo
          return (
            <SubscriptionWrapper
              id={this.props.conversation.id}
              startSubscription={() => {
              return this._subscribeToNewMessages(subscribeToMore)
            }}>
              <Scroller
                id='message-viewport'
                edges={messageEdges}
                direction='up'
                style={{
                  overflow: 'auto',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  flexDirection: 'column-reverse',
                }}
                mapper={(edge, next) => (
                  <Message
                    key={edge.node.id}
                    conversation={this.props.conversation}
                    message={edge.node}
                    next={next.node} />
                )}
                onLoadMore={() => {
                  this.setState({loaded: true})
                  if (!pageInfo.hasNextPage) return

                  fetchMore({
                    variables: {conversationId: this.props.conversation.id, cursor: pageInfo.endCursor},
                    updateQuery: (prev, {fetchMoreResult}) => {
                      const edges = fetchMoreResult.conversation.messages.edges
                      const pageInfo = fetchMoreResult.conversation.messages.pageInfo
                      return edges.length ? {
                        ...prev,
                        conversation: {
                          ...prev.conversation,
                          messages: {
                            __typename: prev.conversation.messages.__typename,
                            edges: mergeAppend(edges, prev.conversation.messages.edges, (e) => e.node.id),
                            pageInfo
                          }
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