import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import UserHandle from './UserHandle'
import Avatar from './Avatar'

export default function UserListEntry({pad, margin, onClick, user, ...props}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      style={{cursor: 'pointer'}}
      background={hover ? 'lightHover' : null}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      direction='row'
      align='center'
      pad={pad || 'xxsmall'}
      margin={margin}
      onClick={() => onClick && onClick(user)}
      fill='horizontal'>
      <Avatar user={user} {...props} />
      <Box>
        <UserHandle includePresence={true} user={user} {...props} />
        <Text size='small'>{user.name}</Text>
      </Box>
    </Box>
  )
}