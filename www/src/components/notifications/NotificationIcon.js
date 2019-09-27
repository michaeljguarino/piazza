import React, {useState} from 'react'
import {Box, Stack, Text} from 'grommet'
import {Query, Mutation} from 'react-apollo'
import {Notification} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import HoveredBackground from '../utils/HoveredBackground'
import NotificationList from './NotificationList'
import {NOTIFICATIONS_Q, NEW_NOTIFICATIONS_SUB, VIEW_NOTIFICATIONS} from './queries'
import {updateConversations} from '../conversation/utils'
import WebNotification from 'react-web-notification';
import {CurrentUserContext} from '../login/EnsureLogin'
import {conversationNameString} from '../conversation/Conversation'


async function _subscribeToNewNotifications(subscribeToMore, unseen, setUnseen, setCurrentNotification) {
  subscribeToMore({
    document: NEW_NOTIFICATIONS_SUB,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const newNotification = subscriptionData.data.newNotifications
      const edges = prev.notifications.edges
      if (edges.find(({node}) => node.id === newNotification.id)) return prev
      setUnseen(unseen + 1)
      setCurrentNotification(newNotification)

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

function convName(conv, me) {
  if (conv.chat) {
    return `chat with ${conversationNameString(conv, me)}`
  }
  return conv.name
}

function getTitle(notif, me) {
  const conv = notif.message.conversation

  switch (notif.type) {
    case "WELCOME":
      return "You've enabled notifications!"
    case "MENTION":
      return `@${notif.actor.handle} mentioned you in ${convName(conv, me)}`
    case "MESSAGE":
      return `New message in ${convName(conv, me)}`
    default:
      return null
  }
}

function BrowserNotif(props) {
  return (
    <CurrentUserContext.Consumer>
    {me => {
      const title = getTitle(props, me)
      if (!title) return null
      return (
        <WebNotification
          title={title}
          onShow={() => props.setCurrentNotification(null)}
          options={{
            body: props.message.text
          }}
          timeout={2000}
        />)
    }}
    </CurrentUserContext.Consumer>
  )
}

function introduction() {
  if (localStorage.getItem('piazza-nuxed')) return null

  localStorage.setItem('piazza-nuxed', true)
  return {type: 'WELCOME', message: {text: 'Welcome to Piazza!'}}
}

function NotificationIcon(props) {
  const [unseen, setUnseen] = useState(props.me.unseenNotifications || 0)
  const [currentNotification, setCurrentNotification] = useState(introduction())

  return (
    <>
    {currentNotification && (
      <BrowserNotif
      setCurrentNotification={setCurrentNotification}
      {...currentNotification} />
    )}
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
            _subscribeToNewNotifications(subscribeToMore, unseen, setUnseen, setCurrentNotification)
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
                        background='notif'
                        align='center'
                        justify='center'
                        height='15px'
                        width='15px'
                        round>
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
                      {...props} />
                  </Box>
                </Dropdown>
            )}
            </Mutation>
          )}}
        </Query>
      </Box>
    </HoveredBackground>
    </>
  )
}

export default NotificationIcon