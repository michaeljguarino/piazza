import React from 'react'
import {Box, Text} from 'grommet'
import Avatar from './Avatar'

function UserDetail(props) {
  return (
    <Box direction="column" pad='small' gap='small'>
      <Box direction="row">
        <Avatar user={props.user} />
        <Box>
          <Text size='small' weight='bold'>{"@" + props.user.handle}</Text>
          <Text size='small' color='dark-6'>{props.user.name}</Text>
        </Box>
      </Box>
      {props.user.bio && (
        <Box direction="column">
          <Text>Bio</Text>
          <Text size='small'>{props.user.bio || 'A man of few words'}</Text>
        </Box>
      )}
    </Box>
  )
}

export default UserDetail