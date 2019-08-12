import React, {useState} from 'react'
import {Query} from 'react-apollo'
import {Box, Text} from 'grommet'
import {Pin} from 'grommet-icons'
import Scroller from '../utils/Scroller'
import Flyout, {FlyoutHeader} from '../utils/Flyout'
import {PINNED_MESSAGES} from '../messages/queries'
import {mergeAppend} from '../../utils/array'
import {BOX_ATTRS} from './ConversationHeader'
import Message from '../messages/Message'


function PinnedMessages(props) {
  const [hover, setHover] = useState(false)
  const color = hover ? 'accent-1' : null
  return (
    <Query
      query={PINNED_MESSAGES}
      variables={{conversationId: props.conversation.id}}
      pollInterval={30000}>
    {({loading, data, fetchMore}) => {
      if (loading) return (<Box direction='row'>...</Box>)
      const conv = data.conversation
      const messageEdges = data.conversation.pinnedMessages.edges
      const pageInfo = data.conversation.pinnedMessages.pageInfo
      return (
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
                  key={edge.node.id}
                  conversation={props.conversation}
                  message={edge.node}
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
      )
    }}
    </Query>

  )
}

export default PinnedMessages