import React from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Text, Anchor } from 'grommet'
import UserHandle from '../users/UserHandle'
import Avatar from '../users/Avatar'

function Mention({notif, setCurrentConversation}) {
  return (
    <Box direction='row' gap='xsmall'>
      <UserHandle user={notif.actor} />
      <Text size='small'>mentioned you in</Text>
      <Anchor size='small' onClick={() => setCurrentConversation(notif)}>
        #{notif.message.conversation.name}
      </Anchor>
    </Box>
  )
}

function Message({notif, setCurrentConversation}) {
  return (
    <Box direction='row' gap='xsmall'>
      <Text size='small' margin={{right: '3px'}}>New message in</Text>
      <Anchor size='small' onClick={() => setCurrentConversation(notif)}>
        #{notif.message.conversation.name}
      </Anchor>
    </Box>
  )
}

function NotifInner({notification, setCurrentConversation}) {
  switch(notification.type) {
    case "MENTION":
      return <Mention notif={notification} setCurrentConversation={setCurrentConversation} />
    case "MESSAGE":
      return <Message notif={notification} setCurrentConversation={setCurrentConversation} />
    default:
      return null
  }
}

export default function Notification({notification}) {
  let history = useHistory()

  function setCurrentConversation({message: {conversation: {id}}, workspace}) {
    history.push(`/wk/${workspace.id}/${id}`)
  }

  return (
    <Box direction='row' align='center' gap='small' margin={{bottom: '5px'}}>
      <Avatar user={notification.actor} size='40px' />
      <Box>
        <NotifInner notification={notification} setCurrentConversation={setCurrentConversation} />
        <Text size='small' color='dark-3'>workspace: {notification.workspace.name}</Text>
      </Box>
    </Box>
  )
}