import React from 'react'
import Conversation from './Conversation'
import Me from '../users/Me'
import {Box} from 'grommet'
import ConversationCreator from './ConversationCreator'
import Chats from './Chats'
import Scroller from '../utils/Scroller'
import {mergeAppend} from '../../utils/array'

function ConversationPanel(props) {
  let padding = {left: '10px'}
  return (
    <Box>
      <Me me={props.me} pad={padding} />
      <Box margin={{bottom: 'medium'}}>
        <ConversationCreator
          padding={padding}
          setCurrentConversation={props.setCurrentConversation} />
        <Scroller
          id='conversations-list'
          style={{
            overflow: 'auto',
            maxHeight: '40vh'
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
                  ...prev,
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
            key={edge.node.id}
            currentConversation={props.currentConversation}
            setCurrentConversation={props.setCurrentConversation}
            conversation={edge.node} />
          } />
      </Box>
      <Chats
        pad={padding}
        currentConversation={props.currentConversation}
        setCurrentConversation={props.setCurrentConversation}
        chats={props.chats}
      />
    </Box>
  )
}

export default ConversationPanel