import React from 'react'
import {Box, Text, Markdown} from 'grommet'
import {Robot} from 'grommet-icons'
import Avatar from '../users/Avatar'
import moment from 'moment'
import MessageEmbed from './MessageEmbed'
import UserHandle from '../users/UserHandle'
import PresenceIndicator from '../users/PresenceIndicator'
import WithPresence from '../utils/presence'
import FileIcon, { defaultStyles } from 'react-file-icon';

function TextMessage(props) {
  return (
    <Text size='xsmall'>
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

function Message(props) {
  let date = moment(props.message.insertedAt)
  let consecutive = props.message.creator.id === (props.next && props.next.creator.id)
  return (
    <Box flex={false} direction='row' pad={{top: '10px'}} margin={{left: 'small'}}>
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
              <TextMessage {...props.message} />)
          }
        </Box>
      </Box>
    </Box>
  )
}

export default Message