import React, { useState, useContext, useMemo } from 'react'
import { Box, Text } from 'grommet'
import { Lock, Close } from 'grommet-icons'
import { HoveredBackground } from 'forge-core'
import {WithAnyPresent} from '../utils/presence'
import PresenceIndicator, { EmptyPresenceIndicator } from '../users/PresenceIndicator'
import { CurrentUserContext } from '../login/EnsureLogin'
import { useMutation } from 'react-apollo'
import { DELETE_PARTICIPANT } from './queries'
import { removeConversation } from './ConversationHeader'
import { Status } from '../users/UserStatus'

export function Icon({me, conversation, emptyColor, textProps}) {
  if (conversation.chat) {
    const {chatParticipants} = conversation
    const len = chatParticipants.length
    const ids = chatParticipants
                  .filter(({user: {id}}) => len <= 1 || id !== me.id)
                  .map(({user: {id}}) => id)
    return (
      <WithAnyPresent ids={ids}>
      {present => (present ?
        <PresenceIndicator present /> :
        <EmptyPresenceIndicator emptyColor={emptyColor} />)}
      </WithAnyPresent>
    )
  }
  if (conversation.public)
    return (<Text {...textProps}>#</Text>)

  return <Lock size='14px' {...textProps} />
}

export function NotificationBadge({unread}) {
  if (unread > 0) {
    return (
      <Box
        width='30px'
        margin={{vertical: '2px', right: '7px'}}
        align='center'
        justify='center'
        background='notif'
        round='xsmall'>
        <Text size='xsmall' color='white'>{unread}</Text>
      </Box>
    )
  }
  return null
}

export function conversationNameString(conversation, me) {
  const {chatParticipants} = conversation
  const len  = chatParticipants.length
  return (conversation.chat ?
    chatParticipants
      .filter(({user}) => len <= 1 || user.id !== me.id)
      .map(({user}) => user.handle).join(", ") : conversation.name)
}

function CloseChat({conversation, me, currentConversation, setCurrentConversation, textSize}) {
  const [hover, setHover] = useState(false)
  const [mutation] = useMutation(DELETE_PARTICIPANT, {
    variables: {conversationId: conversation.id, userId: me.id},
    update: (cache) => {
      removeConversation(cache, conversation.id)
      if (currentConversation.id === conversation.id) setCurrentConversation(null)
    }
  })

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{zIndex: 5}}
      onClick={(e) => { e.stopPropagation(); mutation() }}
      margin={{right: '15px'}}
      align='center'
      justify='center'>
      <Close color={hover ? 'focusText' : 'sidebarText'} size={textSize || 'small'} />
    </Box>
  )
}

function ConversationName({conversation, me, textProps, textSize}) {
  return (
    <Text size={textSize || 'small'} {...textProps} >
      {conversationNameString(conversation, me)}
    </Text>
  )
}

function ConversationModifier({conversation, hover, selected, ...props}) {
  if (conversation.unreadNotifications > 0 && !selected)
    return <NotificationBadge unread={conversation.unreadNotifications} />

  if (conversation.chat && hover)
    return <CloseChat conversation={conversation} {...props} />

  return null
}

export function otherUser(conversation, me) {
  if (!conversation.chat || conversation.chatParticipants.length > 2) return null
  if (conversation.chatParticipants.length === 1) return conversation.chatParticipants[0].user

  const other = conversation.chatParticipants.find(({user}) => user.id !== me.id)
  return other && other.user
}

export default function Conversation({conversation, ...props}) {
  const [hover, setHover] = useState(false)
  const me = useContext(CurrentUserContext)
  let selected = conversation.id === props.currentConversation.id
  let unread = (conversation.unreadMessages > 0 && !selected)
  let textProps = {color: (unread ? 'focusText' : (selected ? 'activeText' : 'sidebarText'))}
  const other = useMemo(() => otherUser(conversation, me), [conversation, me])

  return (
    <HoveredBackground>
      <Box
        style={{outline: 'none'}}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sidebarHover={!selected}
        fill='horizontal'
        direction='row'
        align='center'
        justify='end'
        height='28px'
        focusIndicator={false}
        onClick={() => props.setCurrentConversation(conversation)}
        pad={props.pad}
        background={selected ? 'focus' : null}>
        <Box direction='row' width='100%' align='center' gap='xsmall'>
          <Icon me={me} textProps={textProps} conversation={conversation} {...props} />
          <ConversationName me={me} textProps={textProps} conversation={conversation} />
          {other && (<Status user={other} size={17} />)}
        </Box>
        <ConversationModifier
          hover={hover}
          selected={selected}
          me={me}
          conversation={conversation}
          {...props} />
      </Box>
    </HoveredBackground>
  )
}