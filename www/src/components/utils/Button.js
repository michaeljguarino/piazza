import React, {useState} from 'react'
import {Box, Text} from 'grommet'

const BUTTON_PAD = {horizontal: 'small', vertical: 'xsmall'}

export function SecondaryButton(props) {
  const [hover, setHover] = useState(null)
  const {onClick, label, pad, ...rest} = props
  return (
    <Box
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={props.onClick}
      border
      align='center'
      justify='center'
      elevation={hover ? 'small' : null}
      pad={pad || BUTTON_PAD}
      {...rest}>
      <Text size='small'>{label}</Text>
    </Box>
  )
}

function Button(props) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      onClick={() => !props.disabled && props.onClick()}
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      pad={props.pad || BUTTON_PAD}
      align='center'
      justify='center'
      background={props.disabled ? 'light-6' : 'action'}
      elevation={hover ? 'small' : null}
      margin={props.margin}
      width={props.width}
      height={props.height}
      round={props.round}>
      <Text size={props.textSize || 'small'}>{props.label}</Text>
    </Box>
  )
}

export default Button