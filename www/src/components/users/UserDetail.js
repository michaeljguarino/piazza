import React, { useContext } from 'react'
import { Box, Text, Anchor } from 'grommet'
import { FlyoutHeader, FlyoutContainer, FlyoutContext, Button } from 'forge-core'
import Avatar from './Avatar'
import CreateChat from '../conversation/CreateChat'
import { CurrentUserContext } from '../login/EnsureLogin'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'
import { StatusEmoji } from './UserStatus'

const ChatButton = ({loading, onClick}) => (
  <Button loading={loading} onClick={onClick} label='Create chat' />
)

export function UserDetailSmall({user, setOpen}) {
  const {setFlyoutContent} = useContext(FlyoutContext)

  return (
    <Box width='200px'>
      <Avatar noround size='170px' width='200px' user={user} />
      <Box flex={false} pad='small' gap='small'>
        <Box flex={false}>
          <WithPresence id={user.id}>
          {present => (
            <Box direction='row' gap='xsmall' align='center'>
              <Text size='small' weight={500}>{user.name}</Text>
              <PresenceIndicator present={present} />
            </Box>
          )}
          </WithPresence>
          <Anchor size='small' onClick={() => setFlyoutContent(
            <UserDetail setOpen={setFlyoutContent} user={user} />
          )}>view profile</Anchor>
          <Text size='small' color='dark-6'>{user.title}</Text>
        </Box>
        {user.status && (
          <Box direction='row' gap='xsmall'>
            <StatusEmoji emoji={user.status.emoji} />
            <Text size='small'>{user.status.text}</Text>
          </Box>
        )}
        <Box flex={false}>
          <CreateChat
            user={user}
            onChat={() => setOpen(false)}
            target={ChatButton} />
        </Box>
      </Box>
    </Box>
  )
}

export default function UserDetail({user, setOpen}) {
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
        <Box pad='small'>
          {user.id !== me.id && (
            <CreateChat user={user} onChat={() => setOpen(false)} target={ChatButton} />
          )}
        </Box>
      </Box>
    </FlyoutContainer>
  )
}