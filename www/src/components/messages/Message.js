import React, {useState} from 'react'
import {Box, Text, Markdown, Stack} from 'grommet'
import {Robot, Pin} from 'grommet-icons'
import Avatar from '../users/Avatar'
import moment from 'moment'
import MessageEmbed from './MessageEmbed'
import UserHandle from '../users/UserHandle'
import MessageControls from './MessageControls'
import MessageReactions from './MessageReactions'
import PresenceIndicator from '../users/PresenceIndicator'
import WithPresence from '../utils/presence'
import FileIcon, { defaultStyles } from 'react-file-icon'

function TextMessage(props) {
  return (
    <Text size='small'>
      <WithEntities {...props} />
    </Text>
  )
}

const extension = (file) => file.split('.').pop()

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

function WithEntities(props) {
  if (!props.entities || props.entities.length === 0) return (
    <Markdown>{props.text}</Markdown>
  )
  return <span>{Array.from(splitText(props.text, props.entities))}</span>
}

function* splitText(text, entities) {
  let lastIndex = 0
  let count = 0
  for (let entity of entities) {
    const upTo = text.substring(lastIndex, entity.startIndex)
    if (upTo !== '') {
      yield <Markdown key={count}>{upTo}</Markdown>
      count++
    }
    yield <MessageEntity key={count} entity={entity} />
    count++
    lastIndex = entity.startIndex + entity.length
  }
  if (lastIndex < text.length) {
    yield (<Markdown key={count}>{text.substring(lastIndex)}</Markdown>)
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

function MessageBody(props) {
  const date = moment(props.message.insertedAt)
  const consecutive = props.message.creator.id === (props.next && props.next.creator.id)
  return (
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
              <Text margin={{right: '5px'}}><Robot size='15px'/></Text>
            )}
            {props.message.pinnedAt && (
              <Text margin={{right: '5px'}}><Pin size='15px'/></Text>
            )}
            <WithPresence id={props.message.creator.id} >
              {present => <PresenceIndicator present={present} />}
            </WithPresence>
            <Text size='10px'>
              {date.fromNow()}
            </Text>
          </Box>}
        <Box>
          {props.message.embed ?
            <MessageEmbed {...props.message.embed} /> :
            (props.message.attachment ?
              <AttachmentMessage {...props.message} /> :
              <TextMessage {...props.message} />)}
          {props.message.reactions && props.message.reactions.length > 0 && (
            <MessageReactions {...props} />
          )}
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
      background={isHovered ? 'light-2' : null}
      flex={false}>
      <Stack fill anchor='top-right'>
        <MessageBody hover={isHovered} setPinnedHover={setPinnedHover} {...props} />
        {isHovered && <MessageControls setPinnedHover={setPinnedHover} {...props} />}
      </Stack>
    </Box>
  )
}

export default Message