import React from 'react'
import {Box, Text, Anchor} from 'grommet'
import UserHandle from '../users/UserHandle'
import Avatar from '../users/Avatar'

function Mention({notif, setCurrentConversation}) {
  return (
    <Box direction='row' align='center' margin={{bottom: '5px'}}>
      <Avatar user={notif.actor} size='20px' />
      <UserHandle user={notif.actor} />
      <Box direction='row' gap='xsmall'>
        <Text size='small' margin={{right: '3px'}}>mentioned you in</Text>
        <Anchor size='small' onClick={() => setCurrentConversation(notif.message.conversation)}>
          #{notif.message.conversation.name}
        </Anchor>
      </Box>
    </Box>
  )
}

function Message({notif, setCurrentConversation}) {
  return (
    <Box direction='row' align='center' margin={{bottom: '5px'}}>
      <Avatar user={notif.actor} size='20px' />
      <Box direction='row' gap='xsmall'>
        <Text size='small' margin={{right: '3px'}}>New message in</Text>
        <Anchor size='small' onClick={() => setCurrentConversation(notif.message.conversation)}>
          #{notif.message.conversation.name}
        </Anchor>
      </Box>
    </Box>
  )
}

function Notification({notification, setCurrentConversation}) {
  switch(notification.type) {
    case "MENTION":
      return <Mention notif={notification} setCurrentConversation={setCurrentConversation} />
    case "MESSAGE":
      return <Message notif={notification} setCurrentConversation={setCurrentConversation} />
    default:
      return (<span></span>)
  }
}

export default Notification