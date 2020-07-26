import React, { useContext } from 'react'
import { Box, Text } from 'grommet'
import { FlyoutHeader, FlyoutContainer } from 'forge-core'
import Avatar from './Avatar'
import CreateChat from '../conversation/CreateChat'
import { CurrentUserContext } from '../login/EnsureLogin'

export default function UserDetail({user, onChat, setOpen}) {
  const me = useContext(CurrentUserContext)
  return (
    <FlyoutContainer width='30vw'>
      <FlyoutHeader setOpen={setOpen} text={user.name} />
      <Box direction="column" pad='small' gap='small'>
        <Box direction="row" gap='xsmall'>
          <Avatar size='80px' user={user} rightMargin='0px' />
          <Box>
            <Text>{user.name}</Text>
            <Box direction='row' align='center' gap='xsmall'>
              <Text size='small'>@{user.handle}</Text>
              {user.id !== me.id && (
                <CreateChat user={user} onChat={onChat} />
              )}
            </Box>
            <Text size='small' color='dark-6'>{user.title}</Text>
          </Box>
        </Box>
        <Box direction="column" gap='xsmall'>
          <Box direction='row' gap='xsmall'>
            <Text size='small' weight='bold'>Email:</Text>
            <Text size='small'>{user.email}</Text>
          </Box>
        {user.phone && (
          <Box direction='row' gap='xsmall'>
            <Text size='small' weight='bold'>Phone:</Text>
            <Text size='small'>{user.phone}</Text>
          </Box>
        )}
        {user.bio && (
          <Box>
            <Box>
              <Text size='small' weight='bold'>About Me</Text>
            </Box>
            <Text size='small'>{user.bio || 'A man of few words'}</Text>
          </Box>
        )}
        </Box>
      </Box>
    </FlyoutContainer>
  )
}