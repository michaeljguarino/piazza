import React from 'react'
import {Box, Text} from 'grommet'
import {Lock} from 'grommet-icons'
import {WithAnyPresent} from '../utils/presence'
import HoveredBackground from '../utils/HoveredBackground'
import PresenceIndicator, {EmptyPresenceIndicator} from '../users/PresenceIndicator'
import {CurrentUserContext} from '../login/EnsureLogin'

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
  let selected = props.conversation.id === props.currentConversation.id
  let unread = (props.conversation.unreadMessages > 0 && !selected)
  let textProps = {color: (unread ? 'focusText' : (selected ? 'activeText' : 'sidebarText'))}

  return (
    <HoveredBackground>
      <Box
        sidebarHover={!selected}
        fill='horizontal'
        direction='row'
        align='center'
        justify='end'
        height='25px'
        style={{cursor: 'pointer'}}
        onClick={() => props.setCurrentConversation(props.conversation)}
        pad={props.pad}
        background={selected ? 'focus' : null}
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
    </HoveredBackground>
  )
}

export default Conversation