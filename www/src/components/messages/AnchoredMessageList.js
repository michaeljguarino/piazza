import React from 'react'
import {Box, Text, Stack} from 'grommet'
import {Down} from 'grommet-icons'
import Message from './Message'
import { Query } from 'react-apollo'
import DualScroller from '../utils/DualScroller'
import Loading from '../utils/Loading'
import {reverse, mergeAppend} from '../../utils/array'
import {ANCHORED_MESSAGES} from './queries'

function RecentItemsOverlay(props) {
  return (
    <Box
      style={{cursor: 'pointer'}}
      onClick={() => props.setAnchor(null)}
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

function AnchoredMessageList(props) {
  const defaultVars = {conversationId: props.conversation.id, anchor: props.anchor.timestamp}
  return (
    <Query query={ANCHORED_MESSAGES} variables={defaultVars} fetchPolicy='cache-and-network'>
      {({loading, error, data, fetchMore}) => {
        if (loading && !data.conversation) return <Loading height='calc(100vh - 135px)' />
        if (error) return <div>wtf</div>

        let results = data.conversation
        let allEdges = [...Array.from(reverse(results.before.edges)), ...results.after.edges]
        return (
          <Stack anchor="bottom" fill>
            <DualScroller
              id='message-viewport'
              edges={Array.from(reverse(allEdges))}
              overlay={<RecentItemsOverlay {...props} />}
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
                  selected={edge.node.id === props.anchor.id}
                  key={edge.node.id}
                  conversation={props.conversation}
                  message={edge.node}
                  next={next.node} />
              )}
              onLoadMore={(direction) => {
                const pageInfo = results[direction].pageInfo
                if (!pageInfo.hasNextPage) return
                let vars = direction === 'before' ?
                  {beforeCursor: pageInfo.endCursor} : {afterCursor: pageInfo.endCursor}

                fetchMore({
                  variables: {...defaultVars, ...vars},
                  updateQuery: (prev, {fetchMoreResult}) => {
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
                })
              }}
            />
            <RecentItemsOverlay {...props} />
          </Stack>
        )
      }}
    </Query>
  )

}

export default AnchoredMessageList