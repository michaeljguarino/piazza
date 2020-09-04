import React, { useState, useRef, useContext, useCallback, useEffect } from 'react'
import { Box, Text, Markdown, Stack, Anchor, Drop, ThemeContext } from 'grommet'
import { Pin, Copy } from 'grommet-icons'
import { TooltipContent, Divider, BotIcon, FlyoutContext, WithCopy, HoveredBackground } from 'forge-core'
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
import { sortBy } from 'lodash'
import { DropdownItem } from '../users/Me'
import UserDetail, { UserDetailSmall } from '../users/UserDetail'
import CreateChat from '../conversation/CreateChat'
import Highlight from 'react-highlight.js'
import hljs from 'highlight.js'
import { normalizeColor } from 'grommet/utils'


function TextMessage({text, entities}) {
  return (
    <WithEntities text={text} entities={entities} />
  )
}

const PINNED_BACKGROUND='rgba(var(--sk_secondary_highlight,242,199,68),.1)'
const PIN_COLOR='rgb(242,199,68)'

function Blockquote({children}) {
  return (
    <Box border={{side: 'left', size: '2px', color: 'light-6'}} pad={{horizontal: 'small'}}>
      {children}
    </Box>
  )
}

function Code({children, className, multiline}) {
  const theme = useContext(ThemeContext)
  if (className && className.startsWith('lang-')) {
    const lang = className && className.slice(5)
    if (hljs.getLanguage(lang)) {
      return (
        <Box fill='horizontal' round='xxsmall' border={{color: 'light-5'}}>
          <Box fill='horizontal' border={{side: 'bottom', color: 'light-5'}} direction='row' justify='end'
            gap='xsmall' background='light-3' pad='xsmall' align='center'>
            <Text size='small' weight={500} color='dark-3'>language:</Text>
            <Text size='small' color='dark-3'>{lang}</Text>
            <WithCopy text={children} pillText={`copied ${lang} contents`}>
              <Copy style={{cursor: 'pointer'}} size='small' />
            </WithCopy>
          </Box>
          <Highlight language={lang}>{children}</Highlight>
        </Box>
      )
    }
  }

  return (
    <Box flex={false} style={{display: 'inline-block', color: multiline ? null : normalizeColor('notif', theme)}}
         pad={multiline ? 'xsmall' : {horizontal: 'xxsmall'}} round='xxsmall'
         border={{color: 'light-6'}} background='light-2'>
      <pre>
        <code>{children}</code>
      </pre>
    </Box>
  )
}

function Preformat({children}) {
  console.log(children)
  return (
    <Box flex={false} pad={{vertical: 'xsmall'}}>
      {React.cloneElement(children, {multiline: true})}
    </Box>
  )
}

const WithEntities = React.memo(({text, entities}) => {
  const parsed = [...splitText(text, entities)].join('')
  const entityMap = entities.reduce((map, entity) => ({...map, [entity.id]: entity}), {})
  const Entity = ({id}) => <MessageEntity entity={entityMap[id]} />

  return (
    <Markdown
      components={{
        MessageEntity: {component: Entity},
        blockquote: {component: Blockquote},
        p: {props: {size: 'small', margin: {top: 'xsmall', bottom: 'xsmall'}, style: {maxWidth: '100%'}}},
        a: {props: {size: 'small', target: '_blank'}, component: Anchor},
        span: {props: {style: {verticalAlign: 'bottom'}}},
        code: {component: Code},
        pre: {component: Preformat}
      }}>
      {parsed}
    </Markdown>
  )
})

function* splitText(text, entities) {
  let lastIndex = 0
  const sorted = sortBy(entities, ({startIndex}) => startIndex)
  for (let entity of sorted) {
    const upTo = text.substring(lastIndex, entity.startIndex)
    if (upTo !== '') {
      yield upTo
    }
    yield `<MessageEntity id="${entity.id}" />`
    lastIndex = entity.startIndex + entity.length
  }

  if (lastIndex < text.length) {
    yield text.substring(lastIndex)
  }
}

const RIGHT_MARGIN = '3px'

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
          marginRight: RIGHT_MARGIN,
          marginLeft: RIGHT_MARGIN,
          display: 'inline-block',
          backgroundImage: `url("${imageUrl}")`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundSize: 'contain'
        }}
    />
    {open && (
      <TooltipContent targetRef={targetRef}>
        <Text size='xsmall'>:{name}:</Text>
      </TooltipContent>
    )}
    </>
  )
}

export function StandardEmoji({name, size}) {
  const targetRef = useRef()
  const [open, setOpen] = useState(false)
  return (
    <>
    <span style={{
      display: 'inline-block', alignItems: 'center', height: `${size}px`, width: `${size}px`,
      lineHeight: '0px', marginRight: RIGHT_MARGIN, marginLeft: RIGHT_MARGIN}}
      ref={targetRef} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Emoji forceSize set='google' emoji={name} size={size} sheetSize={16} />
    </span>
    {open && (
      <TooltipContent targetRef={targetRef}>
        <Text size='xsmall'>:{name}:</Text>
      </TooltipContent>
    )}
    </>
  )
}

const EMOJI_SIZE = 18

export function MessageEmoji({entity: {emoji, text}}) {
  if (emoji && emoji.imageUrl) return <CustomEmoji emoji={emoji} size={EMOJI_SIZE} />
  return <StandardEmoji name={text} size={EMOJI_SIZE} />
}

function MessageEntity({entity}) {
  switch(entity.type) {
    case "MENTION":
      return <UserHandle size='xsmall' weight='bold' user={entity.user} />
    case "EMOJI":
      return <MessageEmoji entity={entity} />
    case "CHANNEL_MENTION":
      return <Text style={{background: PINNED_BACKGROUND}} size='small' weight='bold'>{"@" + entity.text}</Text>
    default:
      return null
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

function MessageAvatar({creator}) {
  const ref = useRef()
  const {setFlyoutContent} = useContext(FlyoutContext)
  const [drop, setDrop] = useState(null)
  const openProfile = useCallback(() => setFlyoutContent(
    <UserDetail setOpen={setFlyoutContent} user={creator} />
  ), [creator, setFlyoutContent])

  return (
    <>
    <Box
      ref={ref}
      style={{outline: 'none'}}
      focusIndicator={false}
      flex={false}
      onClick={() => setDrop(<UserDetailSmall user={creator} setOpen={setDrop} />)}
      onContextMenu={(e) => {
        e.preventDefault()
        setDrop(
          <Box flex={false} pad={{vertical: '3px'}}>
            <DropdownItem
              text={`${creator.name}'s profile`}
              onClick={() => {
                openProfile()
                setDrop(null)
              }} />
            <CreateChat
              onChat={() => setDrop(null)}
              user={creator}
              target={({onClick}) => <DropdownItem onClick={onClick} text={`chat with ${creator.name}`} />} />
          </Box>
        )
      }}
    >
      <Avatar user={creator} />
    </Box>
    {drop && (
      <Drop target={ref.current} align={{top: 'top', left: 'right'}} onClickOutside={() => setDrop(null)}>
        {drop}
      </Drop>
    )}
    </>
  )
}

function MessageBody({message, conversation, next, editing, setEditing, dialog, hover, setPinnedHover, setSize}) {
  const date = moment(message.insertedAt)
  const consecutive = isConsecutive(message, next)
  const [painted, setPainted] = useState(consecutive)
  const formattedDate = date.format(DATE_PATTERN)

  useEffect(() => {
    if (consecutive !== painted) {
      setSize()
    }
    setPainted(consecutive)
  }, [painted, setPainted, consecutive])

  return (
    <Box fill='horizontal' margin={{vertical: '2px'}}>
      <PinHeader {...message} />
      <Box direction='row' pad={{vertical: 'xxsmall', horizontal: 'small'}}>
        {!consecutive && <MessageAvatar creator={message.creator} /> }
        {consecutive && (
          <Box width='45px' justify='center' align='center' flex={false}>
            <Text color='dark-2' size='10px' className='message-reactions'>{formattedDate}</Text>
          </Box>
        )}
        <Box margin={{left: '3px'}} fill='horizontal' align='start'>
          {!consecutive && !editing && (
            <Box fill='horizontal' direction='row' align='center' margin={{bottom: 'xxsmall'}} gap='xsmall'>
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
      <Box flex={false} direction='row'>
        <StructuredMessage {...structuredMessage} />
      </Box>
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
    if (!same === painted) {
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