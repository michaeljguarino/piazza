import React, { useState, useRef, useContext, useCallback, useEffect } from 'react'
import { Box, Text, Markdown, Stack } from 'grommet'
import { Pin } from 'grommet-icons'
import Avatar from '../users/Avatar'
import moment from 'moment'
import MessageEmbed from './MessageEmbed'
import { EditingMessageContext } from './VisibleMessages'
import UserHandle from '../users/UserHandle'
import MessageControls from './MessageControls'
import MessageReactions from './MessageReactions'
import MessageEdit from './MessageEdit'
import PresenceIndicator from '../users/PresenceIndicator'
import { TooltipContent } from '../utils/Tooltip'
import BotIcon from '../utils/BotIcon'
import WithPresence from '../utils/presence'
import StructuredMessage from './StructuredMessage'
import File from './File'
import Divider from '../utils/Divider'
import { Emoji } from 'emoji-mart'
import './message.css'


function TextMessage(props) {
  return (
    <Text size='small'>
      <WithEntities {...props} />
    </Text>
  )
}

const PINNED_BACKGROUND='rgba(var(--sk_secondary_highlight,242,199,68),.1)'
const PIN_COLOR='rgb(242,199,68)'

function MsgMarkdown(props) {
  return (
    <Markdown
      components={{p: {props: {size: 'small', margin: {top: 'xsmall', bottom: 'xsmall'}}}}}>
    {props.children}
    </Markdown>
  )
}

function WithEntities(props) {
  if (!props.entities || props.entities.length === 0) return (
    <MsgMarkdown>{props.text}</MsgMarkdown>
  )
  return (
    <Box direction='row' align='center' gap='xsmall'>
      {Array.from(splitText(props.text, props.entities))}
    </Box>
  )
}

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
        <Emoji tooltip emoji={emoji.name} size={17} />
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
      <Text
        size='xsmall'
        color='dark-3'
        margin={{top: '2px', left: '30px'}}>
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

  return (firstTime.add(-5, 'minutes').isBefore(secondTime))
}

function sameDay(message, next) {
  if (!next) return false
  if (next && !next.insertedAt) return true

  const firstTime = moment(message.insertedAt)
  const secondTime = moment(next.insertedAt)

  return firstTime.isSame(secondTime, 'day');
}

const DATE_PATTERN = 'h:mm a'

function MessageBody({message, conversation, next, editing, setEditing, dialog, hover, setPinnedHover}) {
  const date = moment(message.insertedAt)
  const consecutive = isConsecutive(message, next)
  const formattedDate = date.format(DATE_PATTERN)
  return (
    <Box fill='horizontal'>
      <PinHeader {...message} />
      <Box direction='row' pad={{vertical: 'xxsmall', horizontal: 'small'}}>
        {!consecutive && <Avatar user={message.creator} /> }
        {consecutive && (
          <Box width='45px' justify='center' align='center'>
            <Text color='dark-2' size='10px' className='message-reactions'>{formattedDate}</Text>
          </Box>
        )}
        <Box margin={{left: '3px'}} fill={editing ? 'horizontal' : false}>
          {!consecutive && !editing && (
            <Box direction='row' align='center' margin={{bottom: 'xxsmall'}}>
              <Text weight='bold' size='14px' margin={{right: 'xsmall'}}>{message.creator.name}</Text>
              {message.creator.bot && (<BotIcon margin={{right: 'xsmall'}} />)}
              <WithPresence id={message.creator.id}>
              {present => <PresenceIndicator present={present} />}
              </WithPresence>
              <Text color='dark-2' size='10px'>{formattedDate}</Text>
            </Box>
          )}
          <Box fill='horizontal'>
            {editing ?
              <MessageEdit message={message} setEditing={setEditing} /> :
              <MessageSwitch {...message} />
            }
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

function DateDivider({waterline, message, next}) {
  const same = sameDay(message, next)
  const unread = isWaterline(waterline, message, next)

  if (!same && unread) {
    return (
      <>
      <Box direction='row' justify='end' height='0px'>
        <Box
          style={{zIndex: 5}}
          margin={{top: '-5px'}}
          pad='small'
          background='#ffffff'
          align='center'>
          <Text color='notif' size='small'>unread messages</Text>
        </Box>
      </Box>
      <Divider text={formatDate(message.insertedAt)} color='notif' />
      </>
    )
  }

  if (unread) return <Waterline />
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

function Waterline() {
  return (
    <Box direction='row' border={{color: 'notif', side: 'bottom'}} justify='end' margin={{vertical: 'small'}}>
      <Box background='#fff' pad='small' align='center' margin={{bottom: '-22px'}}>
        <Text color='notif' size='small'>unread messages</Text>
      </Box>
    </Box>
  )
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

const Message = React.memo(({noHover, selected, scrollTo, message, onClick, pos, nopin, setSize, ...props}) => {
  const msgRef = useRef()
  const [pinnedHover, setPinnedHover] = useState(false)
  const [editing, setEditing] = useState(false)
  const {edited, setEdited} = useContext(EditingMessageContext)
  const isEditing = editing || (edited === message.id)
  const additionalClasses = '' + (message.pin && !nopin ? ' pin' : '') + (selected ? ' selected' : '') + (pinnedHover ? ' hovered' : '')

  useEffect(() => {
    if (msgRef && setSize) {
      msgRef.current && setSize(msgRef.current.getBoundingClientRect().height)
    }
  }, [msgRef, setSize, message.id])

  const wrappedSetEditing = useCallback((editing) => {
    setPinnedHover(false)
    setEditing(editing)
    if (!editing) setEdited(null)
  }, [setPinnedHover, setEdited, setEditing])

  return (
    <Box flex={false}>
    {!noHover && <DateDivider message={message} next={props.next} waterline={props.waterline} />}
    <Box
      ref={msgRef}
      id={message.id}
      className={'message' + additionalClasses + (noHover ? ' nohover override' : '')}
      onClick={onClick}
      flex={false}>
      <Stack fill anchor='top-right'>
        <MessageBody
          editing={isEditing}
          setEditing={wrappedSetEditing}
          setPinnedHover={setPinnedHover}
          message={message}
          {...props} />
        <MessageControls
          setEditing={wrappedSetEditing}
          setPinnedHover={setPinnedHover}
          message={message}
          {...props} />
      </Stack>
    </Box>
    </Box>
  )
})

export default Message