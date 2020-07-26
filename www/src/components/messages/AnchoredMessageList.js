import React, { useContext } from 'react'
import {Box, Text, Stack} from 'grommet'
import {Down} from 'grommet-icons'
import Message from './Message'
import { useQuery } from 'react-apollo'
import { DualScroller, Loading } from 'forge-core'
import {reverse, mergeAppend} from '../../utils/array'
import {ANCHORED_MESSAGES} from './queries'
import { Conversations } from '../login/MyConversations'
import { ReplyContext } from './ReplyProvider'
import { ScrollContext } from '../utils/SmoothScroller'

function RecentItemsOverlay({setAnchor}) {
  return (
    <Box
      focusIndicator={false}
      onClick={() => setAnchor(null)}
      direction='row'
      align='center'
      justify='center'
      width='500px'
      round='small'
      background='light-6'
      pad='xsmall'>
      <Text size='small'>Return to recent items <Down size='small' /></Text>
    </Box>
  )
}

const onFetchMore = (direction, prev, {fetchMoreResult}) => {
  const edges = fetchMoreResult.conversation[direction].edges
  const pageInfo = fetchMoreResult.conversation[direction].pageInfo
  if (!edges) return prev

  if (direction === 'before') {
    const merged = mergeAppend(edges, prev.conversation.before.edges, (e) => e.node.id)
    return {
      ...prev,
      conversation: {...prev.conversation, before: {
        ...prev.conversation.before, pageInfo, edges: merged
      }}
    }
  } else {
    const merged = mergeAppend(edges, prev.conversation.after.edges, (e) => e.node.id)
    return {
      ...prev,
      conversation: {...prev.conversation, after: {
        ...prev.conversation.after, pageInfo, edges: merged
      }}
    }
  }
}

function AnchoredMessageList({anchor, setAnchor, ...props}) {
  const { currentConversation } = useContext(Conversations)
  const { setReply } = useContext(ReplyContext)
  const defaultVars = {conversationId: currentConversation.id, anchor: anchor.timestamp}
  const {loading, error, data, fetchMore} = useQuery(ANCHORED_MESSAGES, {
    variables: defaultVars,
    fetchPolicy: 'cache-and-network'
  })
  if (loading) return <Loading height='calc(100vh - 135px)' width='100%' />
  if (error) return <div>wtf</div>
  let results = data.conversation
  let allEdges = [...Array.from(reverse(results.before.edges)), ...results.after.edges]
  const scrollTo = anchor.id ? anchor.id : (results.after.edges[0] && results.after.edges[0].node.id)

  return (
    <Stack anchor="bottom" fill>
      <ScrollContext.Provider value={{setSize: () => null}}>
        <DualScroller
          id='message-viewport'
          edges={Array.from(reverse(allEdges))}
          scrollTo={scrollTo}
          overlay={<RecentItemsOverlay setAnchor={setAnchor} />}
          style={{
            overflow: 'auto',
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            flexDirection: 'column-reverse',
          }}
          mapper={({node}, next, ref, pos) => (
            <Message
              parentRef={ref}
              pos={pos}
              selected={node.id === anchor.id}
              key={node.id}
              conversation={currentConversation}
              message={node}
              setReply={setReply}
              next={next.node} />
          )}
          onLoadMore={(direction) => {
            const pageInfo = results[direction].pageInfo
            if (!pageInfo.hasNextPage) return
            let vars = direction === 'before' ?
              {beforeCursor: pageInfo.endCursor} : {afterCursor: pageInfo.endCursor}

            fetchMore({
              variables: {...defaultVars, ...vars},
              updateQuery: (prev, result) => onFetchMore(direction, prev, result)
            })
          }}
        />
      </ScrollContext.Provider>
      <RecentItemsOverlay setAnchor={setAnchor} />
    </Stack>
  )

}

export default AnchoredMessageList