import React, { useState, useRef, useContext, useCallback } from 'react'
import { Box, Stack, Text } from 'grommet'
import { useQuery, useMutation, useSubscription } from 'react-apollo'
import { Notification } from 'grommet-icons'
import { HoveredBackground, FlyoutContext, FlyoutContainer, FlyoutHeader, Loading } from 'forge-core'
import NotificationList from './NotificationList'
import { NOTIFICATIONS_Q, NEW_NOTIFICATIONS_SUB, VIEW_NOTIFICATIONS } from './queries'
import { updateConversations } from '../conversation/utils'
import WebNotification from 'react-web-notification';
import { conversationNameString } from '../conversation/Conversation'
import { ICON_HEIGHT } from '../Piazza'
import { NOTIF_SOUND } from './constants'
import { CONTEXT_Q } from '../login/queries'
import { Conversations } from '../login/MyConversations'
import { updateNotifications } from '../workspace/utils'

function incrNotifications(client, incr, workspaceId) {
  const {me, ...rest} = client.readQuery({ query: CONTEXT_Q, variables: {workspaceId} })
  client.writeQuery({query: CONTEXT_Q, variables: {workspaceId}, data: {
    ...rest, me: {...me, unseenNotifications: me.unseenNotifications + incr}
  }})
}

function addNewNotification({client, subscriptionData}, setCurrentNotification, updateConversations, workspaceId) {
  if (!subscriptionData.data) return
  const newNotification = subscriptionData.data.newNotifications
  setCurrentNotification(newNotification)
  updateConversations(
    client,
    workspaceId,
    ({node}) => node.id === newNotification.message.conversation.id,
    (e) => ({...e, node: {...e.node, unreadNotifications: e.node.unreadNotifications + 1}})
  )
  incrNotifications(client, 1, workspaceId)
  updateNotifications(
    client,
    ({node: {id}}) => id === newNotification.workspace.id,
    ({node, ...rest}) => ({...rest, node: {...node, unreadNotifications: (node.unreadNotifications || 0) + 1}})
  )

  try {
    const prev = client.readQuery({query: NOTIFICATIONS_Q})
    client.writeQuery({
      query: NOTIFICATIONS_Q,
      data: {
        ...prev,
        notifications: {
          ...prev.notifications,
          edges: [{node: newNotification, __typename: "NotificationEdge"}, ...prev.notifications.edges],
        }
      }
    })
  } catch {
    // nothing
  }
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

const BrowserNotif = React.memo(({me, setCurrentNotification, audioRef, notif}) => {
  const {message, actor} = notif
  const title = getTitle(notif, me)
  if (!title) return null

  return (
    <>
    <WebNotification
      title={title}
      onClose={() => setCurrentNotification(null)}
      onShow={() => audioRef.current && audioRef.current.play()}
      options={{
        body: message.text,
        icon: actor && actor.avatar
      }}
      timeout={2000}
    />
    </>
  )
}, ({notif: {id: first}}, {notif: {id: second}}) => first === second)

function introduction() {
  if (localStorage.getItem('piazza-nuxed')) return null

  localStorage.setItem('piazza-nuxed', true)
  return {type: 'WELCOME', message: {text: 'Welcome to Piazza!'}}
}

function FlyoutContent({unseen, setFlyoutContent}) {
  const {setCurrentConversation, workspaceId} = useContext(Conversations)
  const {data, fetchMore} = useQuery(NOTIFICATIONS_Q)
  const [mutation] = useMutation(VIEW_NOTIFICATIONS, {
    update: (cache) => {
      const {notifications} = cache.readQuery({ query: NOTIFICATIONS_Q });
      cache.writeQuery({
        query: NOTIFICATIONS_Q,
        data: {notifications: {...notifications, edges: []}}
      })
      updateConversations(
        cache, workspaceId, () => true, (e) => ({...e, node: {...e.node, unreadNotifications: 0}}))
      incrNotifications(cache, -unseen, workspaceId)
      updateNotifications(cache, () => true, ({node, ...edge}) => ({...edge, node: {...node, unreadNotifications: 0}}))
    }
  })

  const setOpen = useCallback(() => {
    setFlyoutContent(null)
    mutation()
  }, [setFlyoutContent, mutation])

  if (!data) return (
    <Box width='40vw' height='100%'>
      <Loading />
    </Box>
  )

  const {edges, pageInfo} = data.notifications

  return (
    <FlyoutContainer width='40vw'>
      <FlyoutHeader text='Notifications' setOpen={setOpen} />
      <Box fill pad={{bottom: 'small'}}>
        <NotificationList
          edges={edges}
          fetchMore={fetchMore}
          pageInfo={pageInfo}
          setCurrentConversation={setCurrentConversation} />
      </Box>
    </FlyoutContainer>
  )
}

export default function NotificationIcon({me}) {
  const audioRef = useRef()
  const [currentNotification, setCurrentNotification] = useState(introduction())
  const {workspaceId, currentConversation} = useContext(Conversations)
  const {setFlyoutContent} = useContext(FlyoutContext)
  useSubscription(NEW_NOTIFICATIONS_SUB, {
    onSubscriptionData: (result) => addNewNotification(result, setCurrentNotification, updateConversations, workspaceId)
  })
  const unseen = me.unseenNotifications || 0

  return (
    <>
    {currentNotification && (
      <BrowserNotif
        audioRef={audioRef}
        me={me}
        conversation={currentConversation}
        setCurrentNotification={setCurrentNotification}
        notif={currentNotification} />
    )}
    <HoveredBackground>
      <Box
        accentable
        margin={{right: '15px'}}
        align='center'
        justify='center'>
        <Stack anchor="top-right" style={{cursor: 'pointer'}} onClick={() => setFlyoutContent(
          <FlyoutContent setFlyoutContent={setFlyoutContent} unseen={unseen} />
        )}>
          <Notification size={ICON_HEIGHT} />
          {(unseen && unseen > 0) ?
            <Box
              background='notif'
              align='center'
              justify='center'
              height='15px'
              width='15px'
              round>
              <Text color='white' size='10px'>{unseen > 10 ? '!!' : unseen}</Text>
            </Box> : null
          }
        </Stack>
      </Box>
    </HoveredBackground>
    <audio ref={audioRef} id='sound' preload='auto'>
      <source src={NOTIF_SOUND} type='audio/mp3' />
      <embed hidden={true} autostart='false' loop={false} src={NOTIF_SOUND} />
    </audio>
    </>
  )
}