import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import UserHandle from './UserHandle'
import Avatar from './Avatar'

function UserListEntry(props) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      style={{cursor: 'pointer'}}
      background={hover ? 'light-hover' : null}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      direction='row'
      align='center'
      pad={props.pad || 'xxsmall'}
      onClick={() => props.onClick && props.onClick(props.user)}
      fill='horizontal'>
      <Avatar {...props} />
      <Box>
        <UserHandle includePresence={true} {...props} />
        <Text size='small'>{props.user.name}</Text>
      </Box>
    </Box>
  )
}

export default UserListEntry