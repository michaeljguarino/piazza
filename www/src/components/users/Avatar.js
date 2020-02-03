import React from 'react'
import {Box, Text, Stack} from 'grommet'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'

const background='#ff7b25'
const DEFAULT_SIZE = '40px'

function AvatarInner({user: {backgroundColor, avatar, handle}, size, rightMargin}) {
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

export default function Avatar({withPresence, user, size, rightMargin}) {
  if (withPresence) {
    return (
      <Stack anchor='top-right'>
        <AvatarInner user={user} size={size} rightMargin={rightMargin} />
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
  return <AvatarInner user={user} size={size} rightMargin={rightMargin} />
}