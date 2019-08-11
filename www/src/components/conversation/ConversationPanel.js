import React from 'react'
import Conversation from './Conversation'
import Me from '../users/Me'
import Users from '../users/Users'
import {Box} from 'grommet'
import ConversationCreator from './ConversationCreator'
import ConversationSearch from '../search/ConversationSearch'
import Scroller from '../utils/Scroller'
import {mergeAppend} from '../../utils/array'

function ConversationPanel(props) {
  let padding = {left: '10px'}
  let textColor = '#C0C0C0'
  return (
    <Box>
      <Me me={props.me} pad={padding} />
      <ConversationSearch setCurrentConversation={props.setCurrentConversation} />
      <Box margin={{bottom: 'medium'}}>
        <ConversationCreator
          padding={padding}
          textColor={textColor}
          setCurrentConversation={props.setCurrentConversation} />
        <Scroller
          id='conversations-list'
          style={{
            overflow: 'auto',
            height: '40vh'
          }}
          edges={props.conversations}
          onLoadMore={() => {
            if (!props.pageInfo.hasNextPage) return

            props.loadMore({
              variables: {cursor: props.pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult}) => {
                const edges = fetchMoreResult.conversations.edges
                const pageInfo = fetchMoreResult.conversations.pageInfo

                return edges.length ? {
                  conversations: {
                    ...prev.conversations,
                    pageInfo,
                    edges: mergeAppend(edges, prev.conversations.edges, (e) => e.node.id),
                  }
                } : prev;
              }
            })}}
          mapper={(edge) => <Conversation
            pad={padding}
            color={textColor}
            key={edge.node.id}
            currentConversation={props.currentConversation}
            setCurrentConversation={props.setCurrentConversation}
            conversation={edge.node} />
          } />
      </Box>
      <Users pad={padding} color={textColor} />
    </Box>
  )
}

export default ConversationPanel