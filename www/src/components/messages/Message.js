import React, { useState, useRef, useContext, useCallback, useEffect } from 'react'
import { Box, Text, Markdown, Stack, Anchor } from 'grommet'
import { Pin } from 'grommet-icons'
import { TooltipContent, Divider, BotIcon } from 'forge-core'
import Avatar from '../users/Avatar'
import moment from 'moment'
import MessageEmbed from './MessageEmbed'
import { EditingMessageContext } from './VisibleMessages'
import UserHandle from '../users/UserHandle'
import MessageControls from './MessageControls'
import MessageReactions from './MessageReactions'
import MessageEdit from './MessageEdit'
import PresenceIndicator from '../users/PresenceIndicator'
import WithPresence from '../utils/presence'
import StructuredMessage from './StructuredMessage'
import File from './File'
import { Emoji } from 'emoji-mart'
import './message.css'
import { Status } from '../users/UserStatus'


function TextMessage({text, entities}) {
  return (
    <Text size='small'>
      <WithEntities text={text} entities={entities} />
    </Text>
  )
}

const PINNED_BACKGROUND='rgba(var(--sk_secondary_highlight,242,199,68),.1)'
const PIN_COLOR='rgb(242,199,68)'

function MsgMarkdown({children}) {
  return (
    <Markdown
      components={{
        p: {props: {size: 'small', margin: {top: 'xsmall', bottom: 'xsmall'}}},
        a: {props: {size: 'small', target: '_blank'}, component: Anchor}
      }}>
    {children}
    </Markdown>
  )
}

const WithEntities = React.memo(({text, entities}) => {
  if (!entities || entities.length === 0) return (
    <MsgMarkdown>{text}</MsgMarkdown>
  )
  return (
    <Box direction='row' align='center' gap='xsmall'>
      {Array.from(splitText(text, entities))}
    </Box>
  )
})

function* splitText(text, entities) {
  let lastIndex = 0
  let count = 0
  for (let entity of entities) {
    const upTo = text.substring(lastIndex, entity.startIndex)
    if (upTo !== '') {
      yield <MsgMarkdown key={count}>{upTo}</MsgMarkdown>
      count++
    }
    yield <MessageEntity key={count} entity={entity} />
    count++
    lastIndex = entity.startIndex + entity.length
  }
  if (lastIndex < text.length) {
    yield (<MsgMarkdown key={count}>{text.substring(lastIndex)}</MsgMarkdown>)
  }
}

function CustomEmoji({emoji: {imageUrl, name}, size}) {
  const targetRef = useRef()
  const [open, setOpen] = useState(false)
  return (
    <>
    <span
      ref={targetRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
      backgroundImage: `url("${imageUrl}")`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundSize: 'contain'
    }} />
    {open && (
      <TooltipContent targetRef={targetRef}>
        <Text size='xsmall'>:{name}:</Text>
      </TooltipContent>
    )}
    </>
  )
}

function MessageEntity({entity}) {
  switch(entity.type) {
    case "MENTION":
      return <UserHandle size='xsmall' weight='bold' margin={{right: '0px'}} user={entity.user} />
    case "EMOJI":
      const emoji = entity.emoji
      return (emoji.imageUrl ?
        <CustomEmoji emoji={emoji} size={17} /> :
        <Emoji tooltip set='google' emoji={emoji.name} size={17} />
      )
    case "CHANNEL_MENTION":
      return <Text style={{background: PINNED_BACKGROUND}} size='small' weight='bold'>{"@" + entity.text}</Text>
    default:
      return <span />
  }
}

function MessageSwitch({embed, structuredMessage, ...props}) {
  if (embed) return <MessageEmbed {...embed} />

  if (structuredMessage && structuredMessage._type === 'root') {
    return <StructuredMessage {...structuredMessage} />
  }

  return <TextMessage {...props} />
}

function PinHeader({pin, nopin}) {
  if (!pin || nopin) return null

  return (
    <Box justify='center'>
      <Text size='xsmall' color='dark-3' margin={{top: '2px', left: '30px'}}>
        <Pin color={PIN_COLOR} size='small'/> pinned by @{pin.user.handle}
      </Text>
    </Box>
  )
}


function isConsecutive(message, next) {
  if (!next || !next.creator) return false
  if (message.creator.id !== next.creator.id) return false
  const firstTime = moment(message.insertedAt)
  const secondTime = moment(next.insertedAt)

  return (firstTime.add(-1, 'minutes').isBefore(secondTime))
}

function sameDay(message, next) {
  if (!next) return false
  if (next && !next.insertedAt) return true

  const firstTime = moment(message.insertedAt)
  const secondTime = moment(next.insertedAt)

  return firstTime.isSame(secondTime, 'day');
}

const DATE_PATTERN = 'h:mm a'

function MessageBody({message, conversation, next, editing, setEditing, dialog, hover, setPinnedHover, setSize}) {
  const date = moment(message.insertedAt)
  const consecutive = isConsecutive(message, next)
  const [painted, setPainted] = useState(consecutive)
  const formattedDate = date.format(DATE_PATTERN)

  useEffect(() => {
    if (!consecutive && painted) {
      setSize()
    }
    setPainted(consecutive)
  }, [painted, setPainted, consecutive])

  return (
    <Box fill='horizontal' margin={{vertical: '2px'}}>
      <PinHeader {...message} />
      <Box direction='row' pad={{vertical: 'xxsmall', horizontal: 'small'}}>
        {!consecutive && <Avatar user={message.creator} /> }
        {consecutive && (
          <Box width='45px' justify='center' align='center' flex={false}>
            <Text color='dark-2' size='10px' className='message-reactions'>{formattedDate}</Text>
          </Box>
        )}
        <Box margin={{left: '3px'}} fill={editing ? 'horizontal' : false}>
          {!consecutive && !editing && (
            <Box direction='row' align='center' margin={{bottom: 'xxsmall'}} gap='xsmall'>
              <Text weight='bold' size='14px'>{message.creator.name}</Text>
              {message.creator.bot && (<BotIcon />)}
              {message.creator.status && (<Status user={message.creator} size='15px' />)}
              {!message.creator.status && (
                <WithPresence id={message.creator.id}>
                {present => <PresenceIndicator present={present} />}
                </WithPresence>
              )}
              <Text color='dark-2' size='10px'>{formattedDate}</Text>
            </Box>
          )}
          <Box fill='horizontal'>
            {editing ?
              <MessageEdit message={message} setEditing={setEditing} setSize={setSize} /> :
              <>
              <MessageSwitch {...message} />
              {message.file && (<File file={message.file} />)}
              {message.reactions && message.reactions.length > 0 && (
                <MessageReactions
                  message={message}
                  conversation={conversation}
                  hover={hover}
                  setPinnedHover={setPinnedHover} />
              )}
              {message.parent && (
                <Box border={{side: 'left', color: 'dark-6', size: 'small'}} margin={{top: 'small'}}>
                  <Message noHover message={message.parent} />
                </Box>
              )}
              </>
            }
          </Box>
        </Box>
      </Box>
      {dialog && dialog.anchorMessage.id === message.id && (
        <Dialog dialog={dialog} />
      )}
    </Box>
  )
}

function Dialog({dialog: {structuredMessage}}) {
  return (
    <Box background={PINNED_BACKGROUND} pad={{vertical: 'small', left: '55px'}} fill='horizontal'>
      <Text size='xsmall' color='dark-4'>only visible to you</Text>
      <StructuredMessage {...structuredMessage} />
    </Box>
  )
}

export function formatDate(dt) {
  return moment(dt).calendar(null, {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    lastDay: '[Yesterday]',
    lastWeek: 'dddd',
    sameElse: 'dddd, MMMM Do'
  });
}

function DateDivider({waterline, message, next, setSize}) {
  const same = sameDay(message, next)
  const unread = isWaterline(waterline, message, next)
  const [painted, setPainted] = useState(!same)

  useEffect(() => {
    if (!same && painted) {
      setSize()
    }
    setPainted(!same)
  }, [painted, setPainted, same])


  if (!same && unread) {
    return (
      <Stack anchor='top-right'>
        <Divider text={formatDate(message.insertedAt)} color='notif' />
        <Box direction='row' justify='end' height='0px'>
          <Box margin={{top: '5px'}} pad='small' background='white' align='center' justify='center'>
            <Text color='notif' size='small'>unread messages</Text>
          </Box>
        </Box>
      </Stack>
    )
  }

  // if (unread) return <Waterline />
  if (!same) return <Divider text={formatDate(message.insertedAt)} />

  return null
}

function isWaterline(waterline, message, next) {
  if (!waterline || !next) return false

  const line = moment(waterline)
  const current = moment(message.insertedAt)
  const nxt = moment(next.insertedAt)

  if (line.isBefore(nxt)) return false
  if (line.isAfter(current)) return false

  return true
}

export const MessagePlaceholder = ({index}) => {
  return (
    <Box margin='small' direction='row' align='center' height='70px' width='100%' gap='small' pad='small'>
      <Box round='small' height='30px' width='30px' background='light-3' />
      <Box width='100%' gap='xsmall'>
        <Box height='12px' width='10%' />
        <Box height='12px' width={`${index % 2 === 0 ? 30 : 70}%`} background='light-3' />
        <Box height='12px' width={`${index % 2 === 0 ? 60 : 20}%`} background='light-3' />
      </Box>
    </Box>
  )
}

function UnreadBadge() {
  return (
    <Box
      pad='xsmall'
      className='unread-badge'
      background='white'
      margin={{top: '-15px'}}>
      <Text size='xsmall' color='notif'>unread messages</Text>
    </Box>
  )
}

const firstUnread = (waterline, message, next) => sameDay(message, next) && isWaterline(waterline, message, next)

const Message = React.memo(({noHover, selected, scrollTo, message, onClick, pos, nopin, setSize, ...props}) => {
  const msgRef = useRef()
  const [pinnedHover, setPinnedHover] = useState(false)
  const [editing, setEditing] = useState(null)
  const {edited, setEdited} = useContext(EditingMessageContext)
  const isEditing = editing || (edited === message.id)
  const additionalClasses = '' + ((message.pin || isEditing) && !nopin ? ' pin' : '') + (selected ? ' selected' : '') + (pinnedHover ? ' hovered' : '')

  const wrappedSetEditing = useCallback((editing) => {
    setPinnedHover(false)
    setEditing(editing)
    if (!editing) setEdited(null)
  }, [setPinnedHover, setEdited, setEditing])

  useEffect(() => {
    if (editing === false) setSize && setSize() // only when explicitly disabled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const unread = firstUnread(props.waterline, message, props.next)

  return (
    <Box flex={false} style={unread ? {zIndex: 5} : null}>
    {!noHover && <DateDivider message={message} next={props.next} waterline={props.waterline} setSize={setSize} />}
    <Box
      ref={msgRef}
      id={message.id}
      className={'message' + additionalClasses + (noHover ? ' nohover override' : '')}
      border={unread ? {color: 'notif', side: 'top'} : null}
      onClick={onClick}
      flex={false}>
      <Stack fill anchor='top-right'>
        <MessageBody
          editing={isEditing}
          setEditing={wrappedSetEditing}
          setPinnedHover={setPinnedHover}
          message={message}
          setSize={setSize}
          {...props} />
        <>
        {unread && <UnreadBadge />}
        {!isEditing && (
          <MessageControls
            setEditing={wrappedSetEditing}
            setPinnedHover={setPinnedHover}
            message={message}
            {...props} />
        )}
        </>
      </Stack>
    </Box>
    </Box>
  )
})

export default Message