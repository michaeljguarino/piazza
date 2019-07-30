import React from 'react'
import {Box, Text, Anchor} from 'grommet'
import UserHandle from '../users/UserHandle'

function Mention({notif, setCurrentConversation}) {
  return (
    <Box direction='row' margin={{bottom: '5px'}}>
      <UserHandle user={notif.actor} />
      <Text size='small' margin={{right: '3px'}}>mentioned you in</Text>
      <Anchor size='small' onClick={() => setCurrentConversation(notif.message.conversation)}>
        #{notif.message.conversation.name}
      </Anchor>
    </Box>
  )
}

function Notification(props) {
  let notif = props.notification
  switch(notif.type) {
    case "MENTION":
      return <Mention notif={notif} setCurrentConversation={props.setCurrentConversation} />
    default:
      return (<span></span>)
  }
}

export default Notification