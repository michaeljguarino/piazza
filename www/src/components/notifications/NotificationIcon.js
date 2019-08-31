import React, {useState} from 'react'
import {Box, Stack, Text} from 'grommet'
import {Query, Mutation} from 'react-apollo'
import {Notification} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import HoveredBackground from '../utils/HoveredBackground'
import NotificationList from './NotificationList'
import {NOTIFICATIONS_Q, NEW_NOTIFICATIONS_SUB, VIEW_NOTIFICATIONS} from './queries'
import {updateConversations} from '../conversation/utils'

async function _subscribeToNewNotifications(subscribeToMore, unseen, setUnseen) {
  subscribeToMore({
    document: NEW_NOTIFICATIONS_SUB,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const newNotification = subscriptionData.data.newNotifications
      const edges = prev.notifications.edges
      setUnseen(unseen + 1)

      let newNotificationNode = {node: newNotification, __typename: "NotificationEdge"}
      return Object.assign({}, prev, {
        notifications: {
          ...prev.notifications,
          edges: [newNotificationNode, ...edges],
        }
      })
    }
  })
}

function NotificationIcon(props) {
  const [unseen, setUnseen] = useState(props.me.unseenNotifications || 0)

  return (
    <HoveredBackground>
      <Box
        accentable
        margin={{left: '10px', right: '20px'}}
        align='center'
        justify='center'>
        <Query query={NOTIFICATIONS_Q}>
          {({data, loading, fetchMore, subscribeToMore}) => {
            if (loading) return (<Notification size='25px' />)
            let edges = data.notifications.edges
            let pageInfo = data.notifications.pageInfo
            _subscribeToNewNotifications(subscribeToMore, unseen, setUnseen)
            return (
              <Mutation mutation={VIEW_NOTIFICATIONS} update={(cache, {data: {viewNotifications}}) => {
                const {notifications} = cache.readQuery({ query: NOTIFICATIONS_Q });
                cache.writeQuery({
                  query: NOTIFICATIONS_Q,
                  data: {notifications: {...notifications, edges: []}}
                });
                updateConversations(cache, () => true, (e) => ({...e, node: {...e.node, unreadNotifications: 0}}))
                setUnseen(0)
              }}>
              {mutation => (
                <Dropdown onClose={mutation}>
                  <Stack anchor="top-right" style={{cursor: 'pointer'}}>
                    <Notification size='25px' />
                    {(unseen && unseen > 0) ?
                      <Box
                        background="brand"
                        align='center'
                        justify='center'
                        height='15px'
                        width='15px'
                        round
                      >
                        <Text size='10px'>{unseen}</Text>
                      </Box> : <span></span>
                    }
                  </Stack>
                  <Box pad='small' align='center' justify='center' width='300px'>
                    <NotificationList
                      setUnseen={setUnseen}
                      edges={edges}
                      fetchMore={fetchMore}
                      pageInfo={pageInfo}
                      {...props}
                      />
                  </Box>
                </Dropdown>
            )}
            </Mutation>
          )}}
        </Query>
      </Box>
    </HoveredBackground>
  )
}

export default NotificationIcon