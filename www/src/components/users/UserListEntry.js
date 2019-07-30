import React from 'react'
import {Box} from 'grommet'
import UserHandle from './UserHandle'

function UserListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal'>
      <UserHandle {...props} />
    </Box>
  )
}

export default UserListEntry