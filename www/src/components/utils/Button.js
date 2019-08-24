import React, {useState} from 'react'
import {Box, Text} from 'grommet'

function Button(props) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      onClick={props.onClick}
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      pad={props.pad || 'xsmall'}
      align='center'
      justify='center'
      background={hover ? 'brand-heavy' : 'brand'}
      margin={props.margin}
      width={props.width}
      height={props.height}
      round={props.round}>
      <Text size={props.textSize || 'small'}>{props.label}</Text>
    </Box>
  )
}

export default Button