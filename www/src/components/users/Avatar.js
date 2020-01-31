import React from 'react'
import {Box, Text} from 'grommet'

const background='#ff7b25'
const DEFAULT_SIZE = '40px'

export default function Avatar({user: {backgroundColor, avatar, handle}, size, rightMargin}) {
  const boxSize = size || DEFAULT_SIZE
  return (
    <Box
      border={{style: 'hidden'}}
      style={{minWidth: '40px'}}
      round='xsmall'
      background={avatar ? null : (backgroundColor || background)}
      align='center'
      justify='center'
      width={boxSize}
      height={boxSize}
      margin={{right: rightMargin || '5px'}}>
      {avatar ?
        <img alt='my avatar' height={boxSize} width={boxSize} style={{borderRadius: '6px'}} src={avatar}/> :
        <Text>{handle.charAt(0).toUpperCase()}</Text>
      }
    </Box>
  )
}