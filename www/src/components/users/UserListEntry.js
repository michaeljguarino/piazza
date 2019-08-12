import React from 'react'
import {Box} from 'grommet'
import UserHandle from './UserHandle'

function UserListEntry(props) {
  return (
    <Box direction='row' height='23px' align='center' fill='horizontal'>
      <UserHandle includePresence={true} {...props} />
    </Box>
  )
}

export default UserListEntry