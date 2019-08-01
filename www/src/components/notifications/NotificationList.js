import React from 'react'
import {Mutation} from 'react-apollo'
import {Box, Button} from 'grommet'
import Scroller from '../Scroller'
import {NOTIFICATIONS_Q, VIEW_NOTIFICATIONS} from './queries'
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
      {props.edges.length > 0 &&
        <Mutation mutation={VIEW_NOTIFICATIONS} update={(cache, {data: {viewNotifications}}) => {
          const {notifications} = cache.readQuery({ query: NOTIFICATIONS_Q });
          cache.writeQuery({
            query: NOTIFICATIONS_Q,
            data: {
              notifications: {
                ...notifications,
                edges: [],
              }
            }
          });
          props.setUnseen(0)
        }}>
          {mutation => (
            <Box margin={{top: '10px'}} pad={{left: 'medium', right: 'medium'}}>
              <Button fill={false} style={{lineHeight: '12px'}} onClick={mutation} primary label='Mark read' />
            </Box>
          )}
        </Mutation>
      }
    </span>
  )
}

export default NotificationList