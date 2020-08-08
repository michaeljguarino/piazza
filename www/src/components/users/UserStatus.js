import React, { useRef, useState } from 'react'
import { Box, TextInput, Text, Drop } from 'grommet'
import { Emoji as EmojiIcon, Edit } from 'grommet-icons'
import { HoveredBackground, ModalHeader, Button, SecondaryButton, TooltipContent } from 'forge-core'
import { Emoji } from 'emoji-mart'
import EmojiPicker from '../emoji/EmojiPicker'
import { useMutation } from 'react-apollo'
import { UPDATE_USER } from './queries'

const ICON_SIZE = 20

function EmptyIcon() {
  return (
    <HoveredBackground>
      <Box accentable >
        <EmojiIcon size={`${ICON_SIZE}px`} />
      </Box>
    </HoveredBackground>
  )
}

function StatusIcon({hover, status}) {
  return (
    <Box align='center' justify='center'>
      {hover ? <Edit size={`${ICON_SIZE}px`} /> : <StatusEmoji emoji={status.emoji} />}
    </Box>
  )
}

const PAD = {horizontal: 'small', vertical: 'xsmall'}

export const StatusEmoji = React.forwardRef(({emoji, size, ...props}, ref) => (
  <Box ref={ref} align='center' justify='center' style={{lineHeight: `0px`}} {...props}>
    <Emoji set='google' emoji={emoji} size={size || ICON_SIZE} />
  </Box>
))

const extractStatus = ({status}) => status ? {text: status.text, emoji: status.emoji} : {text: null, status: null}

const PRE_BAKED = [
  {emoji: "palm_tree", text: "On Vacation"},
  {emoji: "calendar", text: "In a Meeting"},
  {emoji: "telephone_receiver", text: "On a call"}
]

export function UpdateStatus({user, setOpen}) {
  const ref = useRef()
  const [drop, setDrop] = useState(null)
  const [status, setStatus] = useState(extractStatus(user))
  const [mutation] = useMutation(UPDATE_USER, {
    variables: {id: user.id, attributes: {status}},
    onCompleted: () => setOpen(null)
  })

  return (
    <>
    <Box width='40vw'>
      <ModalHeader text='Update Status' setOpen={setOpen} />
      <Box pad='small' gap='small'>
        <Box pad={PAD} height='40px' border={{color: 'dark-3'}} align='center' direction='row' round='xsmall'>
          <Box ref={ref} onClick={() => setDrop(
            <Box>
              <EmojiPicker onSelect={({short_names}) => {
                setStatus({...status, emoji: short_names[0]})
                setDrop(null)
              }} />
            </Box>
          )}>
            {status.emoji ? <StatusEmoji emoji={status.emoji} /> : <EmptyIcon /> }
          </Box>
          <TextInput
            plain
            size='small'
            value={status.text || ''}
            placeholder='enter a status'
            onChange={({target: {value}}) => setStatus({...status, text: value})} />
        </Box>
        {!status.emoji && (
          <Box>
            {PRE_BAKED.map((status) => (
              <Box pad={PAD} direction='row' gap='small' hoverIndicator='focus' align='center'
                   round='xxsmall' onClick={() => setStatus(status)}>
                <StatusEmoji emoji={status.emoji} />
                <Text size='small' weight={500}>{status.text}</Text>
              </Box>
            ))}
          </Box>
        )}
        <Box direction='row' justify='end' align='center' gap='small'>
          {user.status && (
            <SecondaryButton label='clear status' onClick={()  => mutation({
              variables: {attributes: {status: null}}
            })} />
          )}
          <Button
            disabled={!status.text || !status.emoji}
            label='Update'
            onClick={mutation} />
        </Box>
      </Box>
    </Box>
    {drop && (
      <Drop target={ref.current} align={{left: 'right'}} onClickOutside={() => setDrop(null)}>
        {drop}
      </Drop>
    )}
    </>
  )
}

export function Status({user: {status}, ...props}) {
  const ref  = useRef()
  const [open, setOpen] = useState(false)
  if (!status) return null

  return (
    <>
    <StatusEmoji
      ref={ref}
      emoji={status.emoji}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props} />
    {open && (
      <TooltipContent targetRef={ref}>
        <Text size='xsmall'>{status.text}</Text>
      </TooltipContent>
    )}
    </>
  )
}

export default function UserStatus({user, setModal}) {
  const [hover, setHover] = useState(false)
  const {status} = user

  return (
    <Box direction='row' gap='small' align='center' pad={PAD} margin={{horizontal: 'small'}}
        onMouseLeave={() => setHover(false)} onMouseEnter={() => setHover(true)}
        border={{color: hover ? 'focus' : 'light-6'}} round='xsmall'
        onClick={() => setModal(<UpdateStatus user={user} setOpen={setModal} />)}>
      {status ? <StatusIcon hover={hover} status={status} /> : <EmptyIcon />}
      <Text size='small' weight={500}>
        {status ? status.text : 'set your status'}
      </Text>
    </Box>
  )
}