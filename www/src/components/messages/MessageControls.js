import React, { useState, useRef, useContext, useCallback } from 'react'
import { useMutation } from 'react-apollo'
import { Box, Drop, Text } from 'grommet'
import { Emoji, Pin, Trash, BlockQuote, Edit, MoreVertical } from 'grommet-icons'
import { HoveredBackground, MenuItem, TooltipContent } from 'forge-core'
import { DELETE_MESSAGE, CREATE_REACTION, MESSAGES_Q, PIN_MESSAGE, PINNED_MESSAGES } from './queries'
import { removeMessage, updateMessage, addPinnedMessage, removePinnedMessage } from './utils'
import EmojiPicker from '../emoji/EmojiPicker'
import { CurrentUserContext } from '../login/EnsureLogin'

const ICON_SIZE = '16px'
const SIZE = '35px'
const CONTROL_ATTRS = {
  fill: true,
  focusIndicator: false,
  pad: 'xsmall',
  hoverIndicator: 'light-2',
  align: 'center',
  justify: 'center',
}
const PAD = '2px'
const OUTER = {height: SIZE, width: SIZE}

function DeleteMessage({message, conversation, setOpen, refreshList}) {
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
    <MenuItem hover='notif'>
      <Box direction='row' align='center' gap='small'>
        <Trash size='12px' />
        <Text size='small' onClick={mutation}>delete message</Text>
      </Box>
    </MenuItem>
  )
}

export function Control({children, tooltip, pad, closed, ...rest}) {
  const ref = useRef()
  const [hover, setHover] = useState(false)
  return (
    <>
    <Box
      ref={ref}
      pad={pad || PAD}
      {...OUTER}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...rest}>
      {children}
    </Box>
    {hover && !closed && (
      <TooltipContent targetRef={ref} align={{bottom: 'top'}}>
        <Text size='xsmall'>{tooltip}</Text>
      </TooltipContent>
    )}
    </>
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
      <Control tooltip='add reaction'>
        <Box ref={ref} accentable onClick={() => toggleOpen(!open)} {...(boxAttrs || CONTROL_ATTRS)}>
          <Emoji size={ICON_SIZE}  />
          {label && (<Text size='xsmall' margin={{left: '2px'}}>{label}</Text>)}
        </Box>
      </Control>
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
      <Control tooltip='pin message'>
        <Box accentable onClick={mutation} {...CONTROL_ATTRS}>
          <Pin size={ICON_SIZE} />
        </Box>
      </Control>
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
    <Box className='message-controls' border={{color: 'light-5'}} elevation='xsmall' background='white'
      direction='row' align='center' height={SIZE} round='xsmall' margin={{right: '10px', top: '-10px'}}>
      <MessageReaction setPinnedHover={setPinnedHover} {...props} />
      <PinMessage {...props} />
      <HoveredBackground>
        <Control tooltip='reply'>
          <Box accentable onClick={() => props.setReply(props.message)} {...CONTROL_ATTRS}>
            <BlockQuote size={ICON_SIZE} />
          </Box>
        </Control>
      </HoveredBackground>
      {props.message.creator.id === me.id && (
        <>
        <HoveredBackground>
          <Control tooltip='more options'>
            <Box accentable ref={dropRef} onClick={() => toggleOpen(!moreOpen)} {...CONTROL_ATTRS}>
              <MoreVertical size={ICON_SIZE} />
            </Box>
          </Control>
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
