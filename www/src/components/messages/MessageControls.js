import React, { useState, useRef, useContext, useCallback } from 'react'
import { useMutation } from 'react-apollo'
import { Box, Drop, Text } from 'grommet'
import { More, Emoji, Pin, Trash, BlockQuote, Edit } from 'grommet-icons'
import { HoveredBackground, MenuItem } from 'forge-core'
import { DELETE_MESSAGE, CREATE_REACTION, MESSAGES_Q, PIN_MESSAGE, PINNED_MESSAGES } from './queries'
import { removeMessage, updateMessage, addPinnedMessage, removePinnedMessage } from './utils'
import EmojiPicker from '../emoji/EmojiPicker'
import { CurrentUserContext } from '../login/EnsureLogin'

const BORDER = {side: 'right', color: 'light-6'}
const CONTROL_ATTRS = {
  focusIndicator: false,
  align: 'center',
  justify: 'center',
  border: BORDER,
  width: '40px'
}

function DeleteMessage({message, conversation, setOpen}) {
  const [mutation] = useMutation(DELETE_MESSAGE, {
    variables: {messageId: message.id},
    update: (cache, {data: {deleteMessage}}) => {
      const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: conversation.id}})
      cache.writeQuery({
        query: MESSAGES_Q,
        variables: {conversationId: conversation.id},
        data: removeMessage(data, deleteMessage)
      })
    },
    onCompleted: () => setOpen(false)
  })

  return (
    <MenuItem hover='focus'>
      <Box direction='row' align='center' gap='small'>
        <Trash size='12px' />
        <Text size='small' onClick={mutation}>delete message</Text>
      </Box>
    </MenuItem>
  )
}

export function MessageReaction({conversation, setPinnedHover, boxAttrs, position, label, onSelect, message}) {
  const ref = useRef()
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

  const toggleOpen = useCallback((value) => {
    setOpen(value)
    setPinnedHover && setPinnedHover(value)
  }, [setOpen, setPinnedHover])

  return (
    <>
    <HoveredBackground>
      <Box ref={ref} accentable onClick={() => toggleOpen(!open)} {...(boxAttrs || CONTROL_ATTRS)}>
        <Emoji size='15px'  />
        {label && (<Text size='xsmall' margin={{left: '2px'}}>{label}</Text>)}
      </Box>
    </HoveredBackground>
    {open && (
      <Drop target={ref.current} align={{right: 'left'}}
        onClickOutside={() => toggleOpen(false)} onEsc={() => toggleOpen(false)}>
        <EmojiPicker onSelect={(emoji) => {
          mutation({variables: {messageId: message.id, name: emoji.id}})
          onSelect && onSelect()
        }} />
     </Drop>
    )}
    </>
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

export default function MessageControls({setPinnedHover, setEditing, ...props}) {
  const me = useContext(CurrentUserContext)
  const dropRef = useRef()
  const [moreOpen, setMoreOpen] = useState(false)

  const toggleOpen = useCallback((val) => {
    setPinnedHover(val)
    setMoreOpen(val)
  }, [setPinnedHover, setMoreOpen])

  const editing = useCallback((open) => {
    setEditing(open)
    setMoreOpen(false)
  }, [setEditing, setMoreOpen])

  return (
    <Box className='message-controls' border={{color: 'light-3'}} elevation='xsmall' background='white'
      direction='row' height='35px' round='xsmall' margin={{right: '10px', top: '-10px'}}>
      <MessageReaction setPinnedHover={setPinnedHover} {...props} />
      <PinMessage {...props} />
      <HoveredBackground>
        <Box accentable onClick={() => props.setReply(props.message)}
          {...CONTROL_ATTRS} border={props.message.creator.id === me.id ? BORDER : null}>
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
          <Drop target={dropRef.current} align={{top: 'bottom'}} margin={{top: '4px'}}
            onClickOutside={() => toggleOpen(false)} onEsc={() => toggleOpen(false)}>
            <Box style={{minWidth: '140px'}} pad={{vertical: 'xxsmall'}}>
              <MenuItem hover='focus'>
                <Box direction='row' align='center' gap='small'>
                  <Edit size='12px' />
                  <Text size='small' onClick={() => editing(true)}>edit message</Text>
                </Box>
              </MenuItem>
              <DeleteMessage setOpen={toggleOpen} {...props} />
            </Box>
          </Drop>
        )}
        </>
      )}
    </Box>
  )
}
