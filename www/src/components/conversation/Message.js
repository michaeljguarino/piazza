import React from 'react'
import {Box, Text, Markdown} from 'grommet'
import {Robot} from 'grommet-icons'
import Avatar from '../users/Avatar'
import moment from 'moment'
import MessageEmbed from './MessageEmbed'
import UserHandle from '../users/UserHandle'
import PresenceIndicator from '../users/PresenceIndicator'
import WithPresence from '../utils/presence'

function TextMessage(props) {
  return (
    <Text size='xsmall'>
      <WithEntities {...props} />
    </Text>
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
    <Box flex={false} direction='row' margin={{left: 'small', top: '10px'}}>
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
            <TextMessage {...props.message} />
          }
        </Box>
      </Box>
    </Box>
  )
}

export default Message