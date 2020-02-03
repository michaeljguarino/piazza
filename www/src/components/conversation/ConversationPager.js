import React, { useState } from 'react'
import { Box, Text } from 'grommet';
import Conversation from './Conversation';
import HoveredBackground from '../utils/HoveredBackground';
import { mergeAppend } from '../../utils/array';

const PADDING = {left: '15px'}

function appendConversations(type, prev, {fetchMoreResult}) {
  const {edges, pageInfo} = fetchMoreResult[type]

    return edges.length ? {
      ...prev,
      [type]: {
        ...prev[type],
        pageInfo,
        edges: mergeAppend(edges, prev[type].edges, (e) => e.node.id),
      }
    } : prev;
}

function NextPage({pageInfo: {hasNextPage, endCursor}, type, fetchMore}) {
  const [hover, setHover] = useState(false)

  return (
    <HoveredBackground>
      <Box
        sidebarHover
        pad={{...PADDING, vertical: 'small'}}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        fill='horizontal'
        direction='row'
        align='center'
        height='24px'
        style={{cursor: 'pointer'}}
        onClick={() => hasNextPage && fetchMore({
          variables: {cursor: endCursor},
          updateQuery: (prev, res) => appendConversations(type, prev, res)
        })}>
        <Text
          color={hover ? 'focusText' : 'sidebarText'}
          size='small'>
          ... more
        </Text>
      </Box>
    </HoveredBackground>
  )
}


export default function ConversationPager({edges, pageInfo, fetchMore, type, currentConversation, setCurrentConversation}) {
  return (
    <Box>
      {edges.map(({node}) => (
        <Conversation
          pad={{...PADDING, vertical: 'small'}}
          key={node.id}
          currentConversation={currentConversation}
          setCurrentConversation={setCurrentConversation}
          conversation={node} />
      ))}
      {pageInfo.hasNextPage && (<NextPage type={type} fetchMore={fetchMore} pageInfo={pageInfo} />)}
    </Box>
  )
}