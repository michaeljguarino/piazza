import React, { useState } from 'react'
import {Box, Text} from 'grommet'
import {Lock} from 'grommet-icons'
import {WithAnyPresent} from '../utils/presence'
import PresenceIndicator, {EmptyPresenceIndicator} from '../users/PresenceIndicator'
import {CurrentUserContext} from '../login/EnsureLogin'

const HOVER_COLOR='brand-heavy'
const NOTIF_COLOR='notif'

export function Icon(props) {
  if (props.conversation.chat) {
    const ids = props.conversation.chatParticipants
                  .filter(({user}) => user.id !== props.me.id)
                  .map(({user}) => user.id)
    return (
      <WithAnyPresent ids={ids}>
      {present => (present ? <PresenceIndicator present /> : <EmptyPresenceIndicator emptyColor={props.emptyColor} />)}
      </WithAnyPresent>
    )
  }
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

export function conversationNameString(conversation, me) {
  return (conversation.chat ?
    conversation.chatParticipants
      .filter(({user}) => user.id !== me.id)
      .map(({user}) => user.handle).join(", ") : conversation.name)
}

function ConversationName(props) {
  return (
    <Text size={props.textSize || 'small'} {...props.textProps} >
      {conversationNameString(props.conversation, props.me)}
    </Text>)
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
        <CurrentUserContext.Consumer>
        {me => (
          <>
            <Icon me={me} textProps={textProps} {...props} />
            <ConversationName me={me} textProps={textProps} conversation={props.conversation} />
          </>
        )}
        </CurrentUserContext.Consumer>
      </Box>
      <NotificationBadge {...props} />
    </Box>
  )
}

export default Conversation