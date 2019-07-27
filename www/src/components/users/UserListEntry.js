import React from 'react'
import {Box, Text, Anchor} from 'grommet'
import {Robot} from 'grommet-icons'

function UserListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal'>
      <Anchor>
        <Text size='small' color={props.color}>@{props.user.handle}</Text>
        {(props.user.bot) ? <Robot/> : ''}
      </Anchor>
    </Box>
  )
}

export default UserListEntry