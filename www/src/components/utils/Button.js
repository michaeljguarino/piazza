import React, {useState} from 'react'
import {Box, Text} from 'grommet'

export function SecondaryButton(props) {
  const {onClick, label, ...rest} = props
  return (
    <Box
      style={{cursor: 'pointer'}}
      onClick={props.onClick}
      border
      align='center'
      justify='center'
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
      pad={props.pad || 'xsmall'}
      align='center'
      justify='center'
      background={props.disabled ? 'light-6' : (hover ? 'brand-heavy' : 'brand')}
      margin={props.margin}
      width={props.width}
      height={props.height}
      round={props.round}>
      <Text size={props.textSize || 'small'}>{props.label}</Text>
    </Box>
  )
}

export default Button