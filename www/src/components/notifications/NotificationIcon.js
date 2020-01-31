import React, { useState, useEffect } from 'react'
import { Box, Stack, Text } from 'grommet'
import { useQuery, useMutation, useApolloClient } from 'react-apollo'
import { Notification } from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import HoveredBackground from '../utils/HoveredBackground'
import NotificationList from './NotificationList'
import { NOTIFICATIONS_Q, NEW_NOTIFICATIONS_SUB, VIEW_NOTIFICATIONS } from './queries'
import { updateConversations } from '../conversation/utils'
import WebNotification from 'react-web-notification';
import { conversationNameString } from '../conversation/Conversation'
import { ICON_HEIGHT, ICON_SPREAD } from '../Piazza'

function _subscribeToNewNotifications(subscribeToMore, unseen, setUnseen, setCurrentNotification, client, updateConversations) {
  return subscribeToMore({
    document: NEW_NOTIFICATIONS_SUB,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const newNotification = subscriptionData.data.newNotifications
      const edges = prev.notifications.edges
      if (edges.find(({node}) => node.id === newNotification.id)) return prev
      setUnseen(unseen + 1)
      setCurrentNotification(newNotification)
      updateConversations(
        client,
        ({node}) => node.id === newNotification.message.conversation.id,
        (e) => ({...e, node: {...e.node, unreadNotifications: e.node.unreadNotifications + 1}})
      )

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

function BrowserNotif({me, setCurrentNotification, ...notif}) {
  const title = getTitle(notif, me)
  if (!title) return null
  return (
    <WebNotification
      title={title}
      onShow={() => setCurrentNotification(null)}
      options={{
        body: notif.message.text
      }}
      timeout={2000}
    />
  )
}

function introduction() {
  if (localStorage.getItem('piazza-nuxed')) return null

  localStorage.setItem('piazza-nuxed', true)
  return {type: 'WELCOME', message: {text: 'Welcome to Piazza!'}}
}

export default function NotificationIcon({me, setCurrentConversation}) {
  const client = useApolloClient()
  const [unseen, setUnseen] = useState(me.unseenNotifications || 0)
  const [currentNotification, setCurrentNotification] = useState(introduction())
  const {data, loading, fetchMore, subscribeToMore} = useQuery(NOTIFICATIONS_Q)
  const [mutation] = useMutation(VIEW_NOTIFICATIONS, {
    update: (cache, {data: {viewNotifications}}) => {
      const {notifications} = cache.readQuery({ query: NOTIFICATIONS_Q });
      cache.writeQuery({
        query: NOTIFICATIONS_Q,
        data: {notifications: {...notifications, edges: []}}
      });
      updateConversations(cache, () => true, (e) => ({...e, node: {...e.node, unreadNotifications: 0}}))
      setUnseen(0)
    }
  })
  useEffect(() => {
    _subscribeToNewNotifications(
      subscribeToMore, unseen, setUnseen, setCurrentNotification, client, updateConversations)
  }, [])

  if (loading) return (<Notification size='25px' />)
  const {edges, pageInfo} = data.notifications

  return (
    <>
    {currentNotification && (
      <BrowserNotif
      me={me}
      setCurrentNotification={setCurrentNotification}
      {...currentNotification} />
    )}
    <HoveredBackground>
      <Box
        accentable
        margin={{left: ICON_SPREAD, right: '15px'}}
        align='center'
        justify='center'>
        <Dropdown onClose={mutation}>
          <Stack anchor="top-right" style={{cursor: 'pointer'}}>
            <Notification size={ICON_HEIGHT} />
            {(unseen && unseen > 0) ?
              <Box
                background='notif'
                align='center'
                justify='center'
                height='15px'
                width='15px'
                round>
                <Text color='white' size='10px'>{unseen}</Text>
              </Box> : <span></span>
            }
          </Stack>
          <Box pad='small' align='center' justify='center' width='300px'>
            <NotificationList
              setUnseen={setUnseen}
              edges={edges}
              fetchMore={fetchMore}
              pageInfo={pageInfo}
              setCurrentConversation={setCurrentConversation} />
          </Box>
        </Dropdown>
      </Box>
    </HoveredBackground>
    </>
  )
}