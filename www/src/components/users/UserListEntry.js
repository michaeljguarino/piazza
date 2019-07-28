import React from 'react'
import {Box, Text, Anchor} from 'grommet'
import {Robot} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import UserDetail from './UserDetail'

function UserListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal'>
      <Dropdown align={{left: 'right'}}>
        <Anchor>
          <Text size='small' color={props.color} margin={{right: '5px'}}>@{props.user.handle}</Text>
          {(props.user.bot) ? <Robot color={props.color} size='small' /> : ''}
        </Anchor>
        <UserDetail user={props.user} />
      </Dropdown>
    </Box>
  )
}

export default UserListEntry