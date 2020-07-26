import React, { useState } from 'react'
import { Box, Text } from 'grommet'
import UserHandle from './UserHandle'
import Avatar from './Avatar'

export default function UserListEntry({pad, margin, onClick, user, ...props}) {
  return (
    <Box
      focusIndicator={false}
      hoverIndicator='lightHover'
      direction='row'
      align='center'
      pad={pad || 'xxsmall'}
      margin={margin}
      onClick={() => onClick && onClick(user)}
      fill='horizontal'>
      <Avatar user={user} {...props} />
      <Box>
        <UserHandle user={user} includePresence {...props} />
        <Text size='small'>{user.name}</Text>
      </Box>
    </Box>
  )
}