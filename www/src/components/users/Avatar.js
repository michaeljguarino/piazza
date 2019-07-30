import React from 'react'
import {Box, Text} from 'grommet'

const background='#ff7b25'

function Avatar(props) {
  return (
    <Box
      border={{style: 'hidden'}}
      round='xsmall'
      background={props.user.backgroundColor || background}
      align='center'
      justify='center'
      width='40px'
      height='40px'
      margin={{right: props.rightMargin || '5px'}}>
      {props.user.avatar ?
        <img alt='my avatar' height='40px' width='40px' style={{borderRadius: '6px'}} src={props.user.avatar}/> :
        <Text>{props.user.handle.charAt(0).toUpperCase()}</Text>
      }
    </Box>
  )
}

export default Avatar