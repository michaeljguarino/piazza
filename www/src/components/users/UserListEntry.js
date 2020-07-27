import React, { useCallback, useContext } from 'react'
import { Box, Text } from 'grommet'
import { FlyoutContext } from 'forge-core'
import UserHandle from './UserHandle'
import Avatar from './Avatar'
import UserDetail from './UserDetail'

export default function UserListEntry({pad, margin, onClick, onChat, user, ...props}) {
  const {setFlyoutContent} = useContext(FlyoutContext)
  const clickHandler = useCallback(() => {
    if (onClick) {
      onClick(user)
    } else {
      setFlyoutContent(<UserDetail onChat={onChat} user={user} setOpen={() => setFlyoutContent(null)} />)
    }
  }, [onClick, setFlyoutContent, onChat, user])

  return (
    <Box focusIndicator={false} hoverIndicator='lightHover' direction='row' fill='horizontal' gap='xsmall'
      align='center' pad={pad || {vertical: 'xsmall', horizontal: 'medium'}} margin={margin}
      onClick={clickHandler}>
      <Avatar user={user} size='35px' {...props} />
      <UserHandle user={user} includePresence noFlyout {...props} />
      <Text size='small' color='dark-3'>{user.name}</Text>
    </Box>
  )
}