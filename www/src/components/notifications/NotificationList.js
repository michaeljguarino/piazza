import React from 'react'
import { Scroller } from 'forge-core'
import Notification from './Notification'
import { mergeAppend } from '../../utils/array'

export default function NotificationList({edges, pageInfo, setCurrentConversation, fetchMore}) {
  return (
    <Scroller
      id='notifications-list'
      edges={edges}
      style={{maxHeight: '400px', overflow: 'auto'}}
      mapper={({node}) => (
        <Notification
          key={node.id}
          notification={node}
          setCurrentConversation={setCurrentConversation}
        />
      )}
      emptyState='No notifications for now'
      onLoadMore={() => {
        if (!pageInfo.hasNextPage) return

        fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult}) => {
            const edges = fetchMoreResult.notifications.edges
            const pageInfo = fetchMoreResult.notifications.pageInfo

            return edges.length ? {
              notifications: {
                ...prev.notifications,
                pageInfo,
                edges: mergeAppend(edges, prev.notifications.edges, (e) => e.node.id),
              }
            } : prev;
          }
        })}}
    />
  )
}