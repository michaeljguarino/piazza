import React from 'react'
import { Scroller } from 'forge-core'
import Notification from './Notification'
import { mergeAppend } from '../../utils/array'

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
      emptyState='No notifications for now'
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: {cursor: pageInfo.endCursor},
        updateQuery: (prev, {fetchMoreResult: {notifications: {edges, pageInfo}}}) => {
          console.log(edges)
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