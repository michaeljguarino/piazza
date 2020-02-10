import React from 'react'
import { Box, Text, Stack } from 'grommet'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'

const DEFAULT_BACKGROUND = '#103A50'
const DEFAULT_SIZE = '40px'

export function AvatarContainer({background, img, text, size, rightMargin}) {
  const boxSize = size || DEFAULT_SIZE

  return (
    <Box
      border={{style: 'hidden'}}
      style={{minWidth: '40px'}}
      round='xsmall'
      background={img ? null : (background || DEFAULT_BACKGROUND)}
      align='center'
      justify='center'
      width={boxSize}
      height={boxSize}
      margin={{right: rightMargin || '5px'}}>
      {img ?
        <img alt='' height={boxSize} width={boxSize} style={{borderRadius: '6px'}} src={img}/> :
        <Text>{text.charAt(0).toUpperCase()}</Text>
      }
    </Box>
  )
}

export default function Avatar({withPresence, user, ...props}) {
  if (withPresence) {
    return (
      <Stack anchor='top-right'>
        <AvatarContainer
          img={user.avatar}
          text={user.handle}
          background={user.backgroundColor}
          {...props} />
        <WithPresence id={user.id}>
        {present => (
          <Box margin={{top: '-2px', right: '-2px'}}>
            <PresenceIndicator present={present} />
          </Box>
        )}
        </WithPresence>
      </Stack>
    )
  }

  return (
    <AvatarContainer
      img={user.avatar}
      text={user.handle}
      background={user.backgroundColor}
      {...props} />
  )
}