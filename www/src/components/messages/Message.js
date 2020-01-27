import React, {useState, useRef, useEffect, useContext} from 'react'
import {Box, Text, Markdown, Stack} from 'grommet'
import {Pin} from 'grommet-icons'
import Avatar from '../users/Avatar'
import moment from 'moment'
import MessageEmbed from './MessageEmbed'
import {VisibleMessagesContext, EditingMessageContext} from './VisibleMessages'
import UserHandle from '../users/UserHandle'
import MessageControls from './MessageControls'
import MessageReactions from './MessageReactions'
import MessageEdit from './MessageEdit'
import PresenceIndicator from '../users/PresenceIndicator'
import {TooltipContent} from '../utils/Tooltip'
import BotIcon from '../utils/BotIcon'
import WithPresence from '../utils/presence'
import StructuredMessage from './StructuredMessage'
import File from './File'
import Divider from '../utils/Divider'
import {Emoji} from 'emoji-mart'
import {intersectRect} from '../../utils/geo'

function TextMessage(props) {
  return (
    <Text size='small'>
      <WithEntities {...props} />
    </Text>
  )
}

const PINNED_BACKGROUND='rgba(var(--sk_secondary_highlight,242,199,68),.1)'
const PIN_COLOR='rgb(242,199,68)'
const SELECTED_BACKGROUND='rgba(255, 229, 119, 0.5)'

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

function CustomEmoji(props) {
  const targetRef = useRef()
  const [open, setOpen] = useState(false)
  return (
    <>
    <span
      ref={targetRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{
      backgroundImage: `url("${props.emoji.imageUrl}")`,
      width: `${props.size}px`,
      height: `${props.size}px`,
      backgroundSize: 'contain'
    }} />
    {open && (
      <TooltipContent targetRef={targetRef}>
        <Text size='xsmall'>:{props.emoji.name}:</Text>
      </TooltipContent>
    )}
    </>
  )
}

function MessageEntity(props) {
  switch(props.entity.type) {
    case "MENTION":
      return <UserHandle size='xsmall' weight='bold' margin={{right: '0px'}} user={props.entity.user} />
    case "EMOJI":
      const emoji = props.entity.emoji
      return (emoji.imageUrl ?
        <CustomEmoji emoji={emoji} size={17} /> :
        <Emoji tooltip emoji={emoji.name} size={17} />
      )
    case "CHANNEL_MENTION":
      return <Text style={{background: PINNED_BACKGROUND}} size='small' weight='bold'>{"@" + props.entity.text}</Text>
    default:
      return <span />
  }
}

function MessageSwitch(props) {
  if (props.embed) {
    return <MessageEmbed {...props.embed} />
  }
  if (props.structuredMessage && props.structuredMessage._type === 'root') {
    return <StructuredMessage {...props.structuredMessage} />
  }

  return <TextMessage {...props} />
}

function PinHeader(props) {
  if (props.pin && !props.nopin) {
    return (
      <Box justify='center'>
        <Text
          size='xsmall'
          color='dark-3'
          margin={{top: '2px', left: '30px'}}>
          <Pin color={PIN_COLOR} size='small'/> pinned by @{props.pin.user.handle}
        </Text>
      </Box>
    )
  }
  return null
}

function isConsecutive(message, next) {
  if (!next) return false
  if (message.creator.id !== next.creator.id) return false
  const firstTime = moment(message.insertedAt)
  const secondTime = moment(next.insertedAt)

  return (firstTime.add(-1, 'minutes').isBefore(secondTime))
}

function sameDay(message, next) {
  if (!next) return true
  const firstTime = moment(message.insertedAt)
  const secondTime = moment(next.insertedAt)

  return firstTime.isSame(secondTime, 'day');
}

function MessageBody(props) {
  const date = moment(props.message.insertedAt)
  const consecutive = isConsecutive(props.message, props.next)
  const background = (props.message.pin && !props.nopin) ? PINNED_BACKGROUND : null
  return (
    <Box fill='horizontal' background={background}>
      <PinHeader {...props.message} />
      <Box direction='row' pad={{vertical: 'xsmall', horizontal: 'small'}}>
        {!consecutive && <Avatar user={props.message.creator} /> }
        {consecutive && <Box width='45px'></Box>}
        <Box fill={props.editing ? 'horizontal' : false}>
          {!consecutive && !props.editing &&
            <Box direction='row' align='center'>
              <Text weight='bold' size='15px' margin={{right: '5px'}}>
                {props.message.creator.name}
              </Text>
              {props.message.creator.bot && (
                <BotIcon />
              )}
              <WithPresence id={props.message.creator.id} >
                {present => <PresenceIndicator present={present} />}
              </WithPresence>
              <Text size='10px'>
                {date.fromNow()}
              </Text>
            </Box>}
          <Box fill='horizontal'>
            {props.editing ?
              <MessageEdit message={props.message} setEditing={props.setEditing} /> :
              <MessageSwitch {...props.message} />
            }
            {props.message.file && (<File file={props.message.file} />)}
            {props.message.reactions && props.message.reactions.length > 0 && (
              <MessageReactions {...props} />
            )}
            {props.message.parent && (
              <Box style={{borderLeft: '2px solid grey'}}>
                <Message noHover message={props.message.parent} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      {props.dialog && props.dialog.anchorMessage.id === props.message.id && (
        <Dialog {...props} />
      )}
    </Box>
  )
}

function Dialog(props) {
  return (
    <Box background={PINNED_BACKGROUND} pad={{vertical: 'small', left: '55px'}} fill='horizontal'>
      <Text size='xsmall' color='dark-4'>only visible to you</Text>
      <StructuredMessage {...props.dialog.structuredMessage} />
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

function DateDivider(props) {
  if (sameDay(props.message, props.next)) return null

  return <Divider text={formatDate(props.message.insertedAt)} />
}

function Waterline(props) {
  if (!props.waterline || !props.next) return null

  const waterline = moment(props.waterline)
  const current = moment(props.message.insertedAt)
  const next = moment(props.next.insertedAt)

  if (waterline.isBefore(next)) return null
  if (waterline.isAfter(current)) return null

  return (
    <Box direction='row' border={{color: 'notif', side: 'bottom'}} justify='end' margin={{vertical: 'small'}}>
      <Box background='#fff' pad='small' align='center' margin={{top: '-22px'}}>
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

function Message(props) {
  const msgRef = useRef()
  const [hover, setHover] = useState(false)
  const [pinnedHover, setPinnedHover] = useState(false)
  const [editing, setEditing] = useState(false)
  const {edited, setEdited} = useContext(EditingMessageContext)
  const isEditing = editing || (edited === props.message.id)
  const isHovered = (pinnedHover || hover) && !props.noHover && !editing
  const background = props.selected ? SELECTED_BACKGROUND : (isHovered && !props.message.pin) ? 'light-2' : null

  function wrappedSetEditing(editing) {
    setPinnedHover(false)
    setEditing(editing)
    if (!editing) setEdited(null)
  }

  const {addMessage, removeMessage} = props

  useEffect(() => {
    if (!props.parentRef || !props.parentRef.current || !msgRef.current) return
    const parent = props.parentRef.current.getBoundingClientRect()
    const child = msgRef.current.getBoundingClientRect()
    if (intersectRect(parent, child)) {
      addMessage(props.message)
    } else {
      removeMessage(props.message)
    }
  }, [props.pos])

  return (
    <>
    <Box
      ref={msgRef}
      id={props.message.id}
      onClick={props.onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      background={background}
      flex={false}>
      <Stack fill anchor='top-right'>
        <MessageBody
          editing={isEditing}
          setEditing={wrappedSetEditing}
          hover={isHovered}
          setPinnedHover={setPinnedHover}
          {...props} />
        {isHovered && (
          <MessageControls setEditing={wrappedSetEditing} setPinnedHover={setPinnedHover} {...props} />
        )}
      </Stack>
    </Box>
    <Waterline message={props.message} next={props.next} waterline={props.waterline} />
    <DateDivider message={props.message} next={props.next} />
    </>
  )
}

function WrappedMessage(props) {
  return (
    <VisibleMessagesContext.Consumer>
    {({addMessage, removeMessage}) => (
      <Message {...props} addMessage={addMessage} removeMessage={removeMessage} />
    )}
    </VisibleMessagesContext.Consumer>
  )
}

export default WrappedMessage