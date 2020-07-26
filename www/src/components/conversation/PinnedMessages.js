import React from 'react'
import { Box, Text } from 'grommet'
import { Pin } from 'grommet-icons'
import { Scroller, Flyout, FlyoutHeader, FlyoutContainer, useSubscription, Loading } from 'forge-core'
import { PINNED_MESSAGE_SUB } from '../messages/queries'
import { addPinnedMessage, removePinnedMessage } from '../messages/utils'
import { mergeAppend } from '../../utils/array'
import { HeaderIcon } from './ConversationHeader'
import Message from '../messages/Message'
import { Loader } from './utils'
import { useQuery } from 'react-apollo'
import { CONVERSATION_CONTEXT } from './queries'

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

function FlyoutContent({conversation, setOpen}) {
  const {data, fetchMore} = useQuery(CONVERSATION_CONTEXT, {variables: {id: conversation.id}})

  if (!data) return <Loading width='50vw' />

  const {pinnedMessages: {edges, pageInfo}} = data.conversation

  return (
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
  )
}

function PinnedMessages({loading, data, subscribeToMore, conversation}) {
  useSubscription(
    () => _subscribeToNewPins(conversation.id, subscribeToMore),
    conversation.id
  )

  if (loading) return <Loader />
  const {pinnedMessageCount} = data.conversation

  return (
    <Flyout target={<HeaderIcon icon={Pin} count={pinnedMessageCount} />}>
    {setOpen => (<FlyoutContent conversation={conversation} setOpen={setOpen} />)}
    </Flyout>
  )
}

export default PinnedMessages