import React from 'react'
import {Box, Text} from 'grommet'
import {Pin} from 'grommet-icons'
import Scroller from '../utils/Scroller'
import Flyout, { FlyoutHeader, FlyoutContainer } from '../utils/Flyout'
import { PINNED_MESSAGE_SUB } from '../messages/queries'
import { addPinnedMessage, removePinnedMessage } from '../messages/utils'
import { mergeAppend } from '../../utils/array'
import { HeaderIcon } from './ConversationHeader'
import Message from '../messages/Message'
import { Loader } from './utils'
import { useSubscription } from '../utils/hooks'

const _subscribeToNewPins = (conversationId, subscribeToMore) => {
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

const onLoadMore = (prev, {fetchMoreResult}) => {
  const edges = fetchMoreResult.conversation.pinnedMessages.edges
  const pageInfo = fetchMoreResult.conversation.pinnedMessages.pageInfo
  return edges.length ? {
    ...prev,
    conversation: {
      ...prev.conversation,
      pinnedMessages: {
        __typename: prev.conversation.pinnedMessages.__typename,
        edges: mergeAppend(edges, prev.conversation.pinnedMessages.edges, (e) => e.node.id),
        pageInfo
      }
    }
  } : prev;
}

function PinnedMessages({loading, data, fetchMore, subscribeToMore, conversation}) {
  useSubscription(
    () => _subscribeToNewPins(conversation.id, subscribeToMore),
    conversation.id
  )

  if (loading) return <Loader />
  const {pinnedMessages: {edges, pageInfo}, pinnedMessageCount} = data.conversation

  return (
    <Flyout target={<HeaderIcon icon={Pin} count={pinnedMessageCount} />}>
    {setOpen => (
      <FlyoutContainer width='50vw'>
        <FlyoutHeader text='Pinned Messages' setOpen={setOpen} />
        <Box pad='small'>
          <Text size='small'>
            <i>
              Pinning messages is a good way to highlight or preserve important context
              in a conversation.
            </i>
          </Text>
        </Box>
        <Scroller
          id='pinned-messages'
          edges={edges}
          style={{
            overflow: 'auto',
            maxHeight: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            flexDirection: 'column',
          }}
          mapper={({node}) => (
            <Message
              key={node.message.id}
              nopin
              conversation={conversation}
              message={node.message}
              next={null} />
          )}
          onLoadMore={() => {
            pageInfo.hasNextPage && fetchMore({
              variables: {conversationId: conversation.id, pinCursor: pageInfo.endCursor},
              updateQuery: onLoadMore
            })
          }} />
      </FlyoutContainer>
    )}
    </Flyout>
  )
}

export default PinnedMessages