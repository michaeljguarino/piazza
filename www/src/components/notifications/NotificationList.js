import React from 'react'
import { Scroller } from 'forge-core'
import Notification from './Notification'
import { mergeAppend } from '../../utils/array'
import { Box, Text } from 'grommet'

function EmptyState() {
  return (
    <Box pad='small'>
      <Text size='small'><i>no notifications for now</i></Text>
    </Box>
  )
}

export default function NotificationList({edges, pageInfo, setCurrentConversation, fetchMore}) {
  return (
    <Scroller
      id='notifications-list'
      edges={edges}
      style={{height: '100%', overflow: 'auto'}}
      mapper={({node}) => (
        <Notification
          key={node.id}
          notification={node}
          setCurrentConversation={setCurrentConversation}
        />
      )}
      emptyState={<EmptyState />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: {cursor: pageInfo.endCursor},
        updateQuery: (prev, {fetchMoreResult: {notifications: {edges, pageInfo}}}) => {
          return {...prev, notifications: {
              ...prev.notifications,
              pageInfo,
              edges: mergeAppend(edges, prev.notifications.edges, ({node: {id}}) => id),
            }
          }
        }
      })}
    />
  )
}