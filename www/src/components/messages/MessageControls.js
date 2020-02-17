import React, { useState, useRef, useContext} from 'react'
import { useMutation, useApolloClient, ApolloProvider } from 'react-apollo'
import { Box, Drop, Text } from 'grommet'
import { More, Emoji, Pin, Trash, BlockQuote, Edit } from 'grommet-icons'
import HoveredBackground from '../utils/HoveredBackground'
import MenuItem from '../utils/MenuItem'
import Popover from 'react-tiny-popover'
import { DELETE_MESSAGE, CREATE_REACTION, MESSAGES_Q, PIN_MESSAGE, PINNED_MESSAGES } from './queries'
import { removeMessage, updateMessage, addPinnedMessage, removePinnedMessage } from './utils'
import EmojiPicker from '../emoji/EmojiPicker'
import { CurrentUserContext } from '../login/EnsureLogin'

const BORDER = {side: 'right', color: 'light-6'}
const CONTROL_ATTRS = {
  style: {cursor: 'pointer'},
  align: 'center',
  justify: 'center',
  border: BORDER,
  width: '40px'
}

function DeleteMessage({message, conversation}) {
  const [mutation] = useMutation(DELETE_MESSAGE, {
    variables: {messageId: message.id},
    update: (cache, {data: {deleteMessage}}) => {
      const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: conversation.id}})
      cache.writeQuery({
        query: MESSAGES_Q,
        variables: {conversationId: conversation.id},
        data: removeMessage(data, deleteMessage)
      })
    }
  })

  return (
    <MenuItem>
      <Box direction='row' align='center' gap='small'>
        <Trash size='12px' />
        <Text size='small' onClick={mutation}>delete message</Text>
      </Box>
    </MenuItem>
  )
}

export function MessageReaction({conversation, setPinnedHover, boxAttrs, position, label, onSelect, message}) {
  const client = useApolloClient()
  const [open, setOpen] = useState(false)
  const [mutation] = useMutation(CREATE_REACTION, {
    update: (cache, {data: {createReaction}}) => {
      const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: conversation.id}})
      cache.writeQuery({
        query: MESSAGES_Q,
        variables: {conversationId: conversation.id},
        data: updateMessage(data, createReaction)
      })
    }
  })

  function toggleOpen(value) {
    setPinnedHover && setPinnedHover(value)
    setOpen(value)
  }

  return (
    <Popover
      isOpen={open}
      position={position || ['left', 'top', 'bottom']}
      onClickOutside={() => toggleOpen(false)}
      containerStyle={{zIndex: '100'}}
      content={
        <ApolloProvider client={client}>
          <EmojiPicker onSelect={(emoji) => {
            mutation({variables: {messageId: message.id, name: emoji.id}})
            onSelect && onSelect()
          }} />
        </ApolloProvider>
      }>
      <HoveredBackground>
        <Box
          accentable
          onClick={() => toggleOpen(!open)}
          {...(boxAttrs || CONTROL_ATTRS)}>
          <Emoji size='15px'  />
          {label && (<Text size='xsmall' margin={{left: '2px'}}>{label}</Text>)}
        </Box>
      </HoveredBackground>
    </Popover>
  )
}

function PinMessage({message, conversation}) {
  const pinned = !!message.pinnedAt
  const [mutation] = useMutation(PIN_MESSAGE, {
    variables: {messageId: message.id, pinned: !pinned},
    update: (cache, {data: {pinMessage}}) => {
      const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: conversation.id}})
      cache.writeQuery({
        query: MESSAGES_Q,
        variables: {conversationId: conversation.id},
        data: updateMessage(data, pinMessage)
      })

      const pinnedData = cache.readQuery({
        query: PINNED_MESSAGES,
        variables: {conversationId: conversation.id}
      })
      cache.writeQuery({
        query: PINNED_MESSAGES,
        variables: {conversationId: conversation.id},
        data: !pinned ? addPinnedMessage(pinnedData, pinMessage) : removePinnedMessage(pinnedData, pinMessage)
      })
    }
  })

  return (
    <HoveredBackground>
      <Box
        accentable
        onClick={mutation}
        {...CONTROL_ATTRS}>
        <Pin size='15px' />
      </Box>
    </HoveredBackground>
  )
}

function MessageControls(props) {
  const me = useContext(CurrentUserContext)
  const dropRef = useRef()
  const [moreOpen, setMoreOpen] = useState(false)
  function toggleOpen(value) {
    props.setPinnedHover(value)
    setMoreOpen(value)
  }

  return (
    <Box
      elevation='xsmall'
      background='white'
      direction='row'
      height='35px'
      round='xsmall'
      margin={{right: '10px', top: '-10px'}}>
      <MessageReaction {...props} />
      <PinMessage {...props} />
      <HoveredBackground>
        <Box
          accentable
          onClick={() => props.setReply(props.message)}
          {...CONTROL_ATTRS}
          border={props.message.creator.id === me.id ? BORDER : null}>
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
  )
}

export default MessageControls