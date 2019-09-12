import React from 'react'
import {Box, Text} from 'grommet'

const background='#ff7b25'
const DEFAULT_SIZE = '40px'

function Avatar(props) {
  const size = props.size || DEFAULT_SIZE
  return (
    <Box
      border={{style: 'hidden'}}
      style={{minWidth: '40px'}}
      round='xsmall'
      background={props.user.backgroundColor || background}
      align='center'
      justify='center'
      width={size}
      height={size}
      margin={{right: props.rightMargin || '5px'}}>
      {props.user.avatar ?
        <img alt='my avatar' height={size} width={size} style={{borderRadius: '6px'}} src={props.user.avatar}/> :
        <Text>{props.user.handle.charAt(0).toUpperCase()}</Text>
      }
    </Box>
  )
}

export default Avatar