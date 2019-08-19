import React from 'react'
import {Box, Text} from 'grommet'
import Avatar from './Avatar'
import CreateChat from '../conversation/CreateChat'
import {CurrentUserContext} from '../login/EnsureLogin'


function UserDetail(props) {
  return (
    <CurrentUserContext.Consumer>
    {me => (
      <Box direction="column" pad='small' gap='small'>
        <Box direction="row" gap='xsmall'>
          <Avatar user={props.user} rightMargin='0px' />
          <Box>
            <Text size='small' weight='bold'>{"@" + props.user.handle}</Text>
            <Text size='small' color='dark-6'>{props.user.name}</Text>
          </Box>
          {props.user.id !== me.id && <CreateChat user={props.user} onChat={props.onChat} />}
        </Box>
        {props.user.bio && (
          <Box direction="column">
            <Text>Bio</Text>
            <Text size='small'>{props.user.bio || 'A man of few words'}</Text>
          </Box>
        )}
      </Box>
    )}
    </CurrentUserContext.Consumer>
  )
}

export default UserDetail