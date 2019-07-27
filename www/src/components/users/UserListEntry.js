import React from 'react'
import {Box, Text} from 'grommet'
import {Robot} from 'grommet-icons'

function UserListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal'>
      <Text size='small' color={props.color}>@{props.user.handle}</Text>
      {(props.user.bot) ? <Robot/> : ''}
    </Box>
  )
}

export default UserListEntry