import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Box, TextInput, Text, Drop, MaskedInput, Calendar, Anchor } from 'grommet'
import { Emoji as EmojiIcon, Edit, Calendar as  CalendarIcon, Clock, FormDown } from 'grommet-icons'
import { HoveredBackground, ModalHeader, Button, SecondaryButton, TooltipContent } from 'forge-core'
import { Emoji } from 'emoji-mart'
import EmojiPicker from '../emoji/EmojiPicker'
import { useMutation } from 'react-apollo'
import { UPDATE_USER } from './queries'
import { DropdownItem } from './Me'
import moment from 'moment'

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
    <Emoji set='google' emoji={emoji} size={size || ICON_SIZE} sheetSize={16} />
  </Box>
))

const extractStatus = ({status}) => status ? {text: status.text, emoji: status.emoji} : {text: null, emoji: null}

function ClearForm({setExpiry, close}) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)

  useEffect(() => {
    if (date && time && /^[0-9][0-9]?:[0-9]{2} (am|pm)$/.test(time)) {
      let day = moment(date)
      let t = moment(time, 'hh:mm a')
      if  (!t) return
      day.hour(t.hour())
      day.minute(t.minute())
      setExpiry({expiry: day.format(), display: day.format('MMM DD hh:mm a')})
      close()
    }
  }, [date, time])

  return (
    <Box direction='row' align='center' gap='small'>
      <Box ref={ref} flex={false} height='35px' direction='row' align='center' border gap='xsmall'
           pad='small' round='xsmall' onClick={() => setOpen(true)}>
        <CalendarIcon size='small' />
        <Text size='small' weight={500}>{date ? date.format('MMM D') : 'click to select'}</Text>
      </Box>
      <Box border fill='horizontal' height='35px' direction='row' align='center'
           gap='xsmall' pad='small' round='xsmall'>
        <Clock size='small' />
        <MaskedInput
          plain
          mask={[
            {
              length: [1, 2],
              options: Array.from({ length: 12 }, (v, k) => k + 1),
              regexp: /^1[0,1-2]$|^0?[1-9]$|^0$/,
              placeholder: 'hh',
            },
            { fixed: ':' },
            {
              length: 2,
              options: ['00', '15', '30', '45'],
              regexp: /^[0-5][0-9]$|^[0-9]$/,
              placeholder: 'mm',
            },
            { fixed: ' ' },
            {
              length: 2,
              options: ['am', 'pm'],
              regexp: /^[ap]m$|^[AP]M$|^[aApP]$/,
              placeholder: 'ap',
            },
          ]}
          value={time || ''}
          onChange={event => setTime(event.target.value)}
        />
      </Box>
      {open && (
        <Drop target={ref.current} align={{left: 'right'}} onClickOutside={() => setOpen(false)}>
          <Box pad='small'>
            <Calendar size='small' onSelect={(d) => {
              setDate(moment(d))
              setOpen(false)
            }} />
          </Box>
        </Drop>
      )}
    </Box>
  )
}

const PRE_BAKED = [
  {status: {emoji: "palm_tree", text: "On Vacation"}, expiry: {offset: {days: 7}, display: '7 days'}},
  {status: {emoji: "calendar", text: "In a Meeting"}, expiry: {offset: {hours: 1}, display: '1 hour'}},
  {status: {emoji: "telephone_receiver", text: "On a call"}, expiry: {offset: {minutes: 30}, display: '30 minutes'}}
]

const EXPIRY_DEFAULTS = [
  {display: '15 minutes', offset: {minutes: 15}},
  {display: '30 minutes', offset: {minutes: 30}},
  {display: '1 hour', offset: {hours: 1}},
  {display: '3 houra', offset: {hours: 2}},
  {display: '1 day', offset: {days: 1}},
  {display: '1 week', offset: {days: 7}}
]

const getExpiry = (duration) => moment().add(moment.duration(duration))

const ITEM_PAD = {horizontal: 'small',  vertical: '4px'}

function ExpiryDropdown({close, setForm, setExpiry}) {
  const updateExpiry = useCallback((expiry) => {
    setExpiry(expiry)
    close()
  }, [setExpiry, close])

  return (
    <Box pad={{vertical: 'xsmall'}}>
      <DropdownItem
        pad={ITEM_PAD}
        text="don't clear"
        onClick={() => updateExpiry({expiry: null, display: "Don't clear"})} />
      {EXPIRY_DEFAULTS.map(({display, offset}) => (
        <DropdownItem
          pad={ITEM_PAD}
          text={display}
          onClick={() => updateExpiry({expiry: getExpiry(offset), display})} />
      ))}
      <DropdownItem pad={ITEM_PAD} text='choose date and time' onClick={() => {
        setForm(true)
        close()
      }} />
    </Box>
  )
}

export function UpdateStatus({user, setOpen}) {
  const ref = useRef()
  const dropRef = useRef()
  const [{ref: target, drop, anchor}, setDrop] = useState({drop: null})
  const [status, setStatus] = useState(extractStatus(user))
  const [{expiry, display}, setExpiry] = useState({expiry: getExpiry({hours: 1}), display: '1 hour'})
  const [form, setForm] = useState(false)
  const [mutation] = useMutation(UPDATE_USER, {
    variables: {id: user.id, attributes: {status, statusExpiresAt: expiry}},
    onCompleted: () => setOpen(null)
  })
  const close = useCallback(() => setDrop({drop: null}), [setDrop])

  return (
    <>
    <Box width='400px'>
      <ModalHeader text='Update Status' setOpen={setOpen} />
      <Box pad='small' gap='small'>
        <Box pad={PAD} height='40px' border={{color: 'dark-3'}} align='center' direction='row' round='xsmall'>
          <Box ref={ref} onClick={() => setDrop({ref, drop: (
            <Box>
              <EmojiPicker onSelect={({short_names}) => {
                setStatus({...status, emoji: short_names[0]})
                close()
              }} />
            </Box>
          )})}>
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
            {PRE_BAKED.map(({status, expiry: {offset, display}}) => (
              <Box pad={PAD} direction='row' gap='small' hoverIndicator='focus' align='center' round='xxsmall'
                onClick={() => {
                  setStatus(status)
                  setExpiry({display, expiry: getExpiry(offset)})
              }}>
                <StatusEmoji emoji={status.emoji} />
                <Text size='small' weight={500}>{status.text}</Text>
                <Text size='small' color='dark-3'>{display}</Text>
              </Box>
            ))}
          </Box>
        )}
        {status.emoji && form && <ClearForm setExpiry={setExpiry} close={() => setForm(false)} />}
        {status.emoji && !form && (
          <Box ref={dropRef} focusIndicator={false} direction='row' align='center' gap='xsmall' >
            <Text size='small' weight='bold'>Clear after: </Text>
            <Anchor  size='small' color='black' onClick={() => setDrop({
              ref: dropRef,
              drop: <ExpiryDropdown close={close} setForm={setForm} setExpiry={setExpiry} />,
              anchor: {top: 'bottom'}
            })}>{display}</Anchor>
            <FormDown size='small' />
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
      <Drop target={target.current} align={anchor || {left: 'right'}} onClickOutside={close}>
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
      <TooltipContent targetRef={ref} margin={{bottom: 'xsmall'}}>
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
    <Box direction='row' gap='small' align='center' pad={PAD} margin='small'
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