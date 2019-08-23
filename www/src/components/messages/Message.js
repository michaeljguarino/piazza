import React, {useState} from 'react'
import {Box, Text, Markdown, Stack} from 'grommet'
import {Pin} from 'grommet-icons'
import Avatar from '../users/Avatar'
import moment from 'moment'
import MessageEmbed from './MessageEmbed'
import UserHandle from '../users/UserHandle'
import MessageControls from './MessageControls'
import MessageReactions from './MessageReactions'
import PresenceIndicator from '../users/PresenceIndicator'
import BotIcon from '../utils/BotIcon'
import WithPresence from '../utils/presence'
import StructuredMessage from './StructuredMessage'
import FileIcon, { defaultStyles } from 'react-file-icon'

function TextMessage(props) {
  return (
    <Text size='small'>
      <WithEntities {...props} />
    </Text>
  )
}

const extension = (file) => file.split('.').pop()
const PINNED_BACKGROUND='rgba(var(--sk_secondary_highlight,242,199,68),.1)'
const PIN_COLOR='rgb(242,199,68)'

function AttachmentMessage(props) {
  const filename = props.attachment.split("?")[0]
  const ext = extension(filename)
  const styles = defaultStyles[ext] || {}
  return (
    <Box>
      <Box margin={{bottom: 'small'}}>
        <TextMessage {...props} />
      </Box>
      <a href={props.attachment} download style={{color: 'inherit', textDecoration: 'none'}}>
        <Box border elevation='xsmall' round='small' align="center" direction='row' pad='xsmall' gap='small'>
          <FileIcon extension={ext} size={40} {...styles} />
          <Box>
            <Text size='small'>{filename.split("/").pop()}</Text>
          </Box>
        </Box>
      </a>
    </Box>
  )
}

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
  return <span>{Array.from(splitText(props.text, props.entities))}</span>
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

function MessageEntity(props) {
  switch(props.entity.type) {
    case "MENTION":
      return <UserHandle size='xsmall' weight='bold' margin={{right: '0px'}} user={props.entity.user} />
    default:
      return <span />
  }
}

function MessageSwitch(props) {
  if (props.embed) {
    return <MessageEmbed {...props.embed} />
  }
  if (props.attachment) {
    return <AttachmentMessage {...props} />
  }
  if (props.structuredMessage && props.structuredMessage._type === 'root') {
    return <StructuredMessage {...props.structuredMessage} />
  }

  return <TextMessage {...props} />
}

function PinHeader(props) {
  if (props.pin) {
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

function MessageBody(props) {
  const date = moment(props.message.insertedAt)
  const consecutive = props.message.creator.id === (props.next && props.next.creator.id)
  const background = props.message.pin ? PINNED_BACKGROUND : null
  return (
    <Box fill='horizontal' background={background}>
      <PinHeader {...props.message} />
      <Box direction='row' pad={{top: '5px', bottom: '5px', left: 'small'}}>
        {!consecutive && <Avatar user={props.message.creator} /> }
        {consecutive && <Box width='45px'></Box>}
        <Box>
          {!consecutive &&
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
          <Box width='100%'>
            <MessageSwitch {...props.message} />
            {props.message.reactions && props.message.reactions.length > 0 && (
              <MessageReactions {...props} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function Message(props) {
  const [hover, setHover] = useState(false)
  const [pinnedHover, setPinnedHover] = useState(false)
  const isHovered = pinnedHover || hover
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      background={(isHovered && !props.message.pin) ? 'light-2' : null}
      flex={false}>
      <Stack fill anchor='top-right'>
        <MessageBody hover={isHovered} setPinnedHover={setPinnedHover} {...props} />
        {isHovered && <MessageControls setPinnedHover={setPinnedHover} {...props} />}
      </Stack>
    </Box>
  )
}

export default Message