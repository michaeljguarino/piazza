import React, { useState } from 'react'
import {Box, Text} from 'grommet'
import {Lock} from 'grommet-icons'

const HOVER_COLOR='#263449'
const NOTIF_COLOR='#EB4D5C'

function Icon(props) {
  if (props.conversation.public)
    return (<Text margin={{right: '5px'}} {...props.textProps}>#</Text>)

  return <Lock style={{marginRight: '5px'}} size='14px' {...props.textProps} />
}

function NotificationBadge(props) {
  if (props.conversation.unreadNotifications > 0) {
    return (
      <Box width='30px' margin={{top: '2px', bottom: '2px', right: '5px'}} align='center' justify='center' background={NOTIF_COLOR} round='xsmall'>
        <Text size='xsmall' color='white'>{props.conversation.unreadNotifications}</Text>
      </Box>
    )
  }
  return null
}

function Conversation(props) {
  const [hover, setHover] = useState(false);
  let selected = props.conversation.id === props.currentConversation.id
  let boxProps = (selected) ? {background: 'accent-1'} : (hover ? {background: HOVER_COLOR} : {})
  let unread = (props.conversation.unreadMessages > 0 && !selected)
  let textProps = (props.selected) ? {} : {color: (unread ? 'white' : props.color)}
  return (
    <Box
      fill='horizontal'
      direction='row'
      align='center'
      justify='end'
      height='25px'
      style={{cursor: 'pointer'}}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => props.setCurrentConversation(props.conversation)}
      pad={props.pad}
      {...boxProps}
      >
      <Box direction='row' width='100%' align='center'>
        <Icon textProps={textProps} {...props} />
        <Text
          size='small'
          {...textProps} >
          {props.conversation.name}
        </Text>
      </Box>
      <NotificationBadge {...props} />
    </Box>
  )
}

export default Conversation