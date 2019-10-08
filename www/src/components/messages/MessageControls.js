import React, {useState, useRef} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Drop, Text} from 'grommet'
import {More, Emoji, Pin, Trash, BlockQuote, Edit} from 'grommet-icons'
import HoveredBackground from '../utils/HoveredBackground'
import MenuItem from '../utils/MenuItem'
import Popover from 'react-tiny-popover'
import {DELETE_MESSAGE, CREATE_REACTION, MESSAGES_Q, PIN_MESSAGE, PINNED_MESSAGES} from './queries'
import {removeMessage, updateMessage, addPinnedMessage, removePinnedMessage} from './utils'
import EmojiPicker from '../emoji/EmojiPicker'
import {CurrentUserContext} from '../login/EnsureLogin'


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
        <MenuItem>
          <Box direction='row' align='center' gap='small'>
            <Trash size='12px' />
            <Text size='small' onClick={mutation}>delete message</Text>
          </Box>
        </MenuItem>
      )}
    </Mutation>
  )
}

export function MessageReaction(props) {
  const [open, setOpen] = useState(false)

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
        containerStyle={{zIndex: '100'}}
        content={
          <EmojiPicker onSelect={(emoji) => {
              mutation({variables: {messageId: props.message.id, name: emoji.id}})
              props.onSelect && props.onSelect()
            }} />
        }>
        <HoveredBackground>
          <Box
            accentable
            onClick={() => toggleOpen(!open)}
            {...boxAttrs}>
            <Emoji size='15px'  />
            {props.label && (<Text size='xsmall' margin={{left: '2px'}}>{props.label}</Text>)}
          </Box>
        </HoveredBackground>
      </Popover>
    )}
    </Mutation>
  )
}

function PinMessage(props) {
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
      <HoveredBackground>
        <Box
          accentable
          onClick={mutation}
          {...CONTROL_ATTRS}>
          <Pin size='15px' />
        </Box>
      </HoveredBackground>
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
    <CurrentUserContext.Consumer>
    {me => (
    <Box
      border
      elevation='xxsmall'
      background='white'
      direction='row'
      height='30px'
      round='xsmall'
      margin={{right: '10px'}}>
      <MessageReaction {...props} />
      <PinMessage {...props} />
      <HoveredBackground>
        <Box
          accentable
          onClick={() => props.setReply(props.message)}
          {...CONTROL_ATTRS}
          border={props.message.creator.id === me.id ? 'right' : null}>
          <BlockQuote size='15px' />
        </Box>
      </HoveredBackground>
      {props.message.creator.id === me.id && (
        <>
        <HoveredBackground>
          <Box accentable ref={dropRef} onClick={() => toggleOpen(!moreOpen)} {...CONTROL_ATTRS}>
            <More size='15px' />
          </Box>
        </HoveredBackground>
        {moreOpen && (
          <Drop
            target={dropRef.current}
            align={{top: 'bottom'}}
            margin={{top: '4px'}}
            onClickOutside={() => toggleOpen(false)}
            onEsc={() => toggleOpen(false)}>
            <Box style={{minWidth: '140px'}} pad={{vertical: 'xxsmall'}}>
              <MenuItem>
                <Box direction='row' align='center' gap='small'>
                  <Edit size='12px' />
                  <Text size='small' onClick={() => props.setEditing(true)}>edit message</Text>
                </Box>
              </MenuItem>
              <DeleteMessage {...props} />
            </Box>
          </Drop>
        )}
        </>
      )}
    </Box>
    )}
    </CurrentUserContext.Consumer>
  )
}

export default MessageControls