import React, {useState} from 'react'
import {Query} from 'react-apollo'
import {Box, Text} from 'grommet'
import {Pin} from 'grommet-icons'
import Scroller from '../utils/Scroller'
import Flyout, {FlyoutHeader} from '../utils/Flyout'
import SubscriptionWrapper from '../utils/SubscriptionWrapper'
import {PINNED_MESSAGES, PINNED_MESSAGE_SUB} from '../messages/queries'
import {addPinnedMessage, removePinnedMessage} from '../messages/utils'
import {mergeAppend} from '../../utils/array'
import {BOX_ATTRS} from './ConversationHeader'
import Message from '../messages/Message'

const _subscribeToNewPins = async (conversationId, subscribeToMore) => {
  return subscribeToMore({
    document: PINNED_MESSAGE_SUB,
    variables: {conversationId: conversationId},
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const pinnedMessageDelta = subscriptionData.data.pinnedMessageDelta
      const pinnedMessage = pinnedMessageDelta.payload

      switch(pinnedMessageDelta.delta) {
        case "CREATE":
          return addPinnedMessage(prev, pinnedMessage)
        case "DELETE":
          return removePinnedMessage(prev, pinnedMessage)
        default:
          return prev
      }
    }
  })
}

function PinnedMessages(props) {
  const [hover, setHover] = useState(false)
  const color = hover ? 'accent-1' : null
  return (
    <Query
      query={PINNED_MESSAGES}
      variables={{conversationId: props.conversation.id}}>
    {({loading, data, fetchMore, subscribeToMore}) => {
      if (loading) return (<Box direction='row'>...</Box>)
      const conv = data.conversation
      const messageEdges = data.conversation.pinnedMessages.edges
      const pageInfo = data.conversation.pinnedMessages.pageInfo
      return (
        <SubscriptionWrapper id={props.conversation.id} startSubscription={() => {
          return _subscribeToNewPins(props.conversation.id, subscribeToMore)
        }}>
          <Flyout target={
            <Box
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              {...BOX_ATTRS}>
              <Text height='15px' style={{lineHeight: '15px'}} margin={{right: '3px'}}>
                <Pin size='15px' color={color} />
              </Text>
              <Text size='xsmall' color={color}>{conv.pinnedMessageCount}</Text>
            </Box>
          }>
          {setOpen => (
            <Box width='30vw'>
              <FlyoutHeader text='Pinned Messages' />
              <Scroller
                id='pinned-messages'
                edges={messageEdges}
                mapper={(edge, next) => (
                  <Message
                    key={edge.node.message.id}
                    conversation={props.conversation}
                    message={edge.node.message}
                    next={null} />
                )}
                onLoadMore={() => {
                  if (!pageInfo.hasNextPage) return

                  fetchMore({
                    variables: {conversationId: props.conversation.id, cursor: pageInfo.endCursor},
                    updateQuery: (prev, {fetchMoreResult}) => {
                      const edges = fetchMoreResult.conversation.pinnedMessages.edges
                      const pageInfo = fetchMoreResult.conversation.pinnedMessages.pageInfo
                      return edges.length ? {
                        conversation: {
                          ...conv,
                          pinnedMessages: {
                            __typename: prev.conversation.pinnedMessages.__typename,
                            edges: mergeAppend(edges, prev.conversation.pinnedMessages.edges, (e) => e.node.id),
                            pageInfo
                          }
                        }
                      } : prev;
                    }
                  })
                }} />
            </Box>
          )}
          </Flyout>
        </SubscriptionWrapper>
      )
    }}
    </Query>

  )
}

export default PinnedMessages