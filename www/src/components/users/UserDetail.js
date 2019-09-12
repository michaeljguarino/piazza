import React from 'react'
import {Box, Text} from 'grommet'
import Avatar from './Avatar'
import CreateChat from '../conversation/CreateChat'
import {CurrentUserContext} from '../login/EnsureLogin'
import {FlyoutHeader} from '../utils/Flyout'

function UserDetail(props) {
  return (
    <CurrentUserContext.Consumer>
    {me => (
      <Box width='30vw'>
        <FlyoutHeader setOpen={props.setOpen} text={props.user.name} />
        <Box direction="column" pad='small' gap='small'>
          <Box direction="row" gap='xsmall'>
            <Avatar size='80px' user={props.user} rightMargin='0px' />
            <Box>
              <Text>{props.user.name}</Text>
              <Text size='small'>@{props.user.handle} {props.user.id !== me.id && (
                <CreateChat user={props.user} onChat={props.onChat} />
              )}</Text>
              <Text size='small' color='dark-6'>{props.user.title}</Text> 
            </Box>
          </Box>
          <Box direction="column" gap='xsmall'>
            <Box direction='row' gap='xsmall'>
              <Text size='small' weight='bold'>Email:</Text>
              <Text size='small'>{props.user.email}</Text>
            </Box>
          {props.user.bio && (
            <Box>
              <Box>
                <Text size='small' weight='bold'>About Me</Text>
              </Box>
              <Text size='small'>{props.user.bio || 'A man of few words'}</Text>
            </Box>
          )}
          </Box>
        </Box>
      </Box>
    )}
    </CurrentUserContext.Consumer>
  )
}

export default UserDetail