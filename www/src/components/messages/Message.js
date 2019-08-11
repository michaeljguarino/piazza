import React, {useState, useRef} from 'react'
import {Box, Text, Markdown, Stack, Anchor, Drop} from 'grommet'
import {Robot, More, Emoji} from 'grommet-icons'
import {Mutation} from 'react-apollo'
import Avatar from '../users/Avatar'
import moment from 'moment'
import MessageEmbed from './MessageEmbed'
import UserHandle from '../users/UserHandle'
import PresenceIndicator from '../users/PresenceIndicator'
import WithPresence from '../utils/presence'
import Tooltip from '../utils/Tooltip'
import {CurrentUserContext} from '../login/EnsureLogin'
import {DELETE_MESSAGE, MESSAGES_Q, CREATE_REACTION, DELETE_REACTION} from './queries'
import {removeMessage, updateMessage} from './utils'
import FileIcon, { defaultStyles } from 'react-file-icon'
import Popover from 'react-tiny-popover'
import 'emoji-mart/css/emoji-mart.css'
import data from 'emoji-mart/data/messenger.json'
import { NimblePicker, Emoji as EmojiComp } from 'emoji-mart'
import {groupBy} from '../../utils/array'

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

function Reaction(props) {
  const prolog = props.reactions.slice(0, 3).map((reaction) => `@${reaction.user.handle}`)
  const text = prolog.length > 2 ? `${prolog.join(', ')} and ${props.reactions.length - prolog.length} more` :
                  prolog.length === 2 ? `${prolog[0]} and ${prolog[1]}` : prolog[0]
  const mutationQuery = props.reactions.find((r) => r.user.id === props.me.id) ?
                          DELETE_REACTION : CREATE_REACTION
  return (
    <Mutation
      mutation={mutationQuery}
      update={(cache, {data}) => {
        let message = data.deleteReaction || data.createReaction
        const prev = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: props.conversation.id}})
        cache.writeQuery({
          query: MESSAGES_Q,
          variables: {conversationId: props.conversation.id},
          data: updateMessage(prev, message)
        })
      }}>
    {mutation => (
      <Tooltip>
        <Box
          pad='3px'
          direction='row'
          style={{cursor: 'pointer'}}
          onClick={() => mutation({variables: {messageId: props.messageId, name: props.name}})}
          height='25px'
          border
          round='xsmall'
          align='center'
          justify='center'>
          <Text size='10px'>
            <EmojiComp forceSize emoji={props.name} size={15} style={{lineHeight: 0}} />
          </Text>
          <Text size='10px' margin={{left: '3px'}}>{props.reactions.length}</Text>
        </Box>
        <Text size='xsmall'>{text} reacted with :{props.name}:</Text>
      </Tooltip>
    )}
    </Mutation>
  )
}

function MessageReactions(props) {
  const grouped = groupBy(props.message.reactions, (reaction) => reaction.name)

  return (
    <CurrentUserContext.Consumer>
      {me => (
        <Box direction='row' gap='xsmall' height='25px' margin={{top: 'xsmall'}}>
          {Object.entries(grouped).map(([name, reactions]) => (
            <Reaction
              key={name}
              me={me}
              conversation={props.conversation}
              name={name}
              reactions={reactions}
              messageId={props.message.id} />
          ))}
        </Box>
      )}
    </CurrentUserContext.Consumer>
  )
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

function DeleteMessage(props) {
  return (
    <Mutation
      mutation={DELETE_MESSAGE}
      variables={{messageId: props.message.id}}
      update={(cache, {data: {deleteMessage}}) => {
        const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: props.conversation.id}})
        cache.writeQuery({
          query: MESSAGES_Q,
          variables: {conversationId: props.conversation.id},
          data: removeMessage(data, deleteMessage)
        })
      }}>
      {mutation => (
        <Anchor size='small' onClick={mutation}>delete</Anchor>
      )}
    </Mutation>
  )
}

function MessageReaction(props) {
  const [open, setOpen] = useState(false)

  function toggleOpen(value) {
    props.setPinnedHover(value)
    setOpen(value)
  }

  return (
    <Mutation
      mutation={CREATE_REACTION}
      update={(cache, {data: {createReaction}}) => {
        const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: props.conversation.id}})
        cache.writeQuery({
          query: MESSAGES_Q,
          variables: {conversationId: props.conversation.id},
          data: updateMessage(data, createReaction)
        })
      }}>
    {mutation => (
      <Popover
        isOpen={open}
        position={['left', 'top', 'bottom']}
        onClickOutside={() => toggleOpen(false)}
        content={
          <NimblePicker data={data} onSelect={(emoji) => mutation({variables: {messageId: props.message.id, name: emoji.id}})} />
        }>
        <Emoji size='15px' onClick={() => toggleOpen(!open)} />
      </Popover>
    )}
    </Mutation>
  )
}

function MessageControls(props) {
  const dropRef = useRef()
  const [moreOpen, setMoreOpen] = useState(false)
  function toggleOpen(value) {
    props.setPinnedHover(value)
    setMoreOpen(value)
  }

  return (
    <Box elevation='xsmall' background='white' direction='row' height='30px' border round='xsmall' width='50px' margin={{right: '10px'}}>
      <Box style={{cursor: 'pointer'}} align='center' justify='center' border='right' width='25px'>
        <MessageReaction {...props} />
      </Box>
      <Box ref={dropRef} style={{cursor: 'pointer'}} align='center' justify='center' width='25px'>
        <More size='15px' onClick={() => toggleOpen(!moreOpen)} />
      </Box>
      {moreOpen && (
          <Drop
            target={dropRef.current}
            align={{top: 'bottom'}}
            onClickOutside={() => toggleOpen(false)}
            onEsc={() => toggleOpen(false)}>
            <Box pad='small'>
              <DeleteMessage {...props} />
            </Box>
          </Drop>
        )}
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
        <MessageBody hover={isHovered} {...props} />
        {isHovered && <MessageControls setPinnedHover={setPinnedHover} {...props} />}
      </Stack>
    </Box>
  )
}

export default Message