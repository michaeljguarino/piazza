import React from 'react'
import Scroller from '../utils/Scroller'
import Notification from './Notification'
import {mergeAppend} from '../../utils/array'

function NotificationList(props) {
  return (
    <span>
      <Scroller
        id='notifications-list'
        edges={props.edges}
        style={{maxHeight: '400px'}}
        mapper={(n) => (
          <Notification
              key={n.node.id}
              notification={n.node}
              setCurrentConversation={props.setCurrentConversation}
          />
        )}
        emptyState='No notifications for now'
        onLoadMore={() => {
          if (!props.pageInfo.hasNextPage) return

          props.fetchMore({
            variables: {cursor: props.pageInfo.endCursor},
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
    </span>
  )
}

export default NotificationList