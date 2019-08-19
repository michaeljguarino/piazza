import React from 'react'
import {Box} from 'grommet'
import Conversation from './Conversation'
import Scroller from '../utils/Scroller'
import ChatCreator from './ChatCreator'
import {mergeAppend} from '../../utils/array'

function Chats(props) {
  return (<Box>
    <ChatCreator textColor={props.color} padding={props.pad} setCurrentConversation={props.setCurrentConversation} />
    <Scroller
      id='chats-list'
      style={{
        overflow: 'auto',
        height: '40vh'
      }}
      edges={props.chats.edges}
      onLoadMore={() => {
        if (!props.chats.pageInfo.hasNextPage) return

        props.loadMore({
          variables: {chatCursor: props.chats.pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult}) => {
            const edges = fetchMoreResult.chats.edges
            const pageInfo = fetchMoreResult.chats.pageInfo

            return edges.length ? {
              ...prev,
              chats: {
                ...prev.chats,
                pageInfo,
                edges: mergeAppend(edges, prev.chats.edges, (e) => e.node.id),
              }
            } : prev;
          }
        })}}
      mapper={(edge) => <Conversation
        pad={props.pad}
        color={props.color}
        key={edge.node.id}
        currentConversation={props.currentConversation}
        setCurrentConversation={props.setCurrentConversation}
        conversation={edge.node} />
      } />
  </Box>)
}

export default Chats