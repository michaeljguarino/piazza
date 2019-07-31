import React, {useState} from 'react'
import {Box, Stack, Text} from 'grommet'
import {Query} from 'react-apollo'
import {Notification} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import NotificationList from './NotificationList'
import {NOTIFICATIONS_Q, NEW_NOTIFICATIONS_SUB} from './queries'

async function _subscribeToNewNotifications(subscribeToMore, unseen, setUnseen) {
  subscribeToMore({
    document: NEW_NOTIFICATIONS_SUB,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      console.log(prev)
      console.log(subscriptionData)
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
    <Box width='50px' align='center' justify='center'>
      <Query query={NOTIFICATIONS_Q}>
        {({data, loading, fetchMore, subscribeToMore}) => {
          if (loading) return (<Notification size='25px' />)
          let edges = data.notifications.edges
          let pageInfo = data.notifications.pageInfo
          _subscribeToNewNotifications(subscribeToMore, unseen, setUnseen)
          return (
            <Dropdown>
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
          )
        }}
      </Query>
    </Box>
  )
}

export default NotificationIcon