import React from 'react'
import {Query} from 'react-apollo'
import Scroller from '../Scroller'
import {NOTIFICATIONS_Q} from './queries'
import Notification from './Notification'
import {mergeAppend} from '../../utils/array'

function NotificationList(props) {
  return (
    <Query query={NOTIFICATIONS_Q}>
      {({data, loading, fetchMore, error, subscribeToMore}) => {
        if (loading) return (<span>loading...</span>)
        let edges = data.notifications.edges
        let pageInfo = data.notifications.pageInfo
        console.log(edges)
        return (
          <Scroller
            id='notifications-list'
            edges={edges}
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
        )}}
    </Query>
  )
}

export default NotificationList