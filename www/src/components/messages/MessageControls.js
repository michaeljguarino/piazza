import React, {useState, useRef} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Drop, Anchor, Text} from 'grommet'
import {More, Emoji, Pin} from 'grommet-icons'
import Popover from 'react-tiny-popover'
import 'emoji-mart/css/emoji-mart.css'
import data from 'emoji-mart/data/messenger.json'
import { NimblePicker } from 'emoji-mart'
import {DELETE_MESSAGE, CREATE_REACTION, MESSAGES_Q, PIN_MESSAGE, PINNED_MESSAGES} from './queries'
import {removeMessage, updateMessage, addPinnedMessage, removePinnedMessage} from './utils'

const CONTROL_ATTRS = {
  style: {cursor: 'pointer'},
  align: 'center',
  justify: 'center',
  border: 'right',
  width: '25px'
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

export function MessageReaction(props) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const color = hovered ? 'accent-1' : null

  function toggleOpen(value) {
    props.setPinnedHover && props.setPinnedHover(value)
    setOpen(value)
  }

  let boxAttrs = props.boxAttrs || CONTROL_ATTRS
  const position = props.position || ['left', 'top', 'bottom']

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
        position={position}
        onClickOutside={() => toggleOpen(false)}
        content={
          <NimblePicker
            data={data}
            onSelect={(emoji) => {
              mutation({variables: {messageId: props.message.id, name: emoji.id}})
              props.onSelect && props.onSelect()
            }} />
        }>
        <Box
          onClick={() => toggleOpen(!open)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          {...boxAttrs}>
          <Emoji size='15px' color={color}  />
          {props.label && (<Text color={color} size='xsmall' margin={{left: '2px'}}>{props.label}</Text>)}
        </Box>
      </Popover>
    )}
    </Mutation>
  )
}

function PinMessage(props) {
  const [hovered, setHovered] = useState(false)
  const pinned = !!props.message.pinnedAt
  return (
    <Mutation
      mutation={PIN_MESSAGE}
      variables={{messageId: props.message.id, pinned: !pinned}}
      update={(cache, {data: {pinMessage}}) => {
        const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: props.conversation.id}})
        cache.writeQuery({
          query: MESSAGES_Q,
          variables: {conversationId: props.conversation.id},
          data: updateMessage(data, pinMessage)
        })

        const pinnedData = cache.readQuery({
          query: PINNED_MESSAGES,
          variables: {conversationId: props.conversation.id}
        })
        cache.writeQuery({
          query: PINNED_MESSAGES,
          variables: {conversationId: props.conversation.id},
          data: !pinned ? addPinnedMessage(pinnedData, pinMessage) : removePinnedMessage(pinnedData, pinMessage)
        })
      }}
    >
    {mutation => (
      <Box
        onClick={mutation}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...CONTROL_ATTRS}>
        <Pin color={hovered ? 'accent-1' : null} size='15px' />
      </Box>
    )}
    </Mutation>
  )
}

function MessageControls(props) {
  const dropRef = useRef()
  const [moreOpen, setMoreOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  function toggleOpen(value) {
    props.setPinnedHover(value)
    setMoreOpen(value)
  }

  return (
    <Box elevation='xsmall' background='white' direction='row' height='30px' border round='xsmall' margin={{right: '10px'}}>
      <MessageReaction {...props} />
      <PinMessage {...props} />
      <Box
        ref={dropRef}
        onClick={() => toggleOpen(!moreOpen)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...CONTROL_ATTRS}>
        <More color={hovered ? 'accent-1' : null} size='15px'  />
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

export default MessageControls