import React, { useContext, useState } from 'react'
import { InputCollection, ResponsiveInput, Button } from 'forge-core'
import CurrentUser, { CurrentUserContext } from '../login/EnsureLogin'
import Avatar from './Avatar'
import { Close, User, SettingsOption, Lock } from 'grommet-icons'
import { useHistory } from 'react-router-dom'
import { useMutation } from 'react-apollo'
import { UPDATE_USER } from './queries'
import UpdatePassword from './UpdatePassword'
import UpdateProfile from './UpdateProfile'
import { Box, Text } from 'grommet'

const VIEWS = {
  ATTRIBUTES: 'a',
  PROFILE: 'p',
  PASSWORD: 'pw'
}

const VIEW_OPTIONS = [
  {text: 'Edit Attributes', view: VIEWS.ATTRIBUTES, icon: User},
  {text: 'Edit Profile', view: VIEWS.PROFILE, icon: SettingsOption},
  {text: 'Change Password', view: VIEWS.PASSWORD, icon: Lock}
]

const userFields = ({email, name}) => ({email, name})

function EditOption({onClick, icon, text}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      border={{color: hover ? 'focus' : 'light-5'}}
      background='white'
      round='xsmall'
      pad='small'
      direction='row'
      align='center'
      gap='xsmall'
      onClick={onClick}>
      {React.createElement(icon, {size: '12px'})}
      <Text size='small'>{text}</Text>
    </Box>
  )
}

function EditAttributes({me, attributes, setAttributes}) {
  const [mutation, {loading}] = useMutation(UPDATE_USER, {
    variables: {id: me.id, attributes}
  })

  return (
    <Box gap='small' fill pad='small'>
      <InputCollection>
        <ResponsiveInput
          label='email'
          value={attributes.email}
          onChange={({target: {value}}) => setAttributes({...attributes, email: value})} />
        <ResponsiveInput
          label='name'
          value={attributes.name}
          onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
      </InputCollection>
      <Box direction='row' justify='end'>
        <Button label='update' onClick={mutation} loading={loading} />
      </Box>
    </Box>
  )
}

function ViewSwitch({me, view, attributes, setAttributes}) {
  switch (view) {
    case VIEWS.ATTRIBUTES:
      return <EditAttributes me={me} attributes={attributes} setAttributes={setAttributes} />
    case VIEWS.PASSWORD:
      return <UpdatePassword me={me} />
    case VIEWS.PROFILE:
      return <UpdateProfile me={me} />
  }
}

function UserEditInner() {
  const me = useContext(CurrentUserContext)
  let history = useHistory()
  const [attributes, setAttributes] = useState(userFields(me))
  const [{view, header}, setView] = useState({view: VIEWS.ATTRIBUTES, header: 'Edit Attributes'})

  return (
    <Box height='100vh' width='100vw'>
      <Box
        flex={false}
        direction='row'
        fill='horizontal'
        pad={{vertical: 'small', horizontal: 'medium'}}
        gap='small'
        border={{side: 'bottom', color: 'light-5'}}>
        <Avatar user={me} />
        <Box flex={false}>
          <Text size='small' weight={500}>{attributes.name}</Text>
          <Text size='small'>{attributes.email}</Text>
        </Box>
        <Box fill='horizontal' direction='row' justify='end'>
          <Box pad='small' round='xsmall' hoverIndicator='light-3' onClick={() => history.goBack()}>
            <Close size='15px' />
          </Box>
        </Box>
      </Box>
      <Box fill direction='row'>
        <Box width='30%' pad='small' gap='xsmall' border={{side: 'right', color: 'light-5'}} background='light-2'>
          {VIEW_OPTIONS.map(({view, text, icon}) => (
            <EditOption text={text} icon={icon} onClick={() => setView({view, header: text})} />
          ))}
        </Box>
        <Box width='70%' pad='large'>
          <Box pad='small' fill='horizontal' align='center'>
            <Text size='small' weight='bold'>{header}</Text>
          </Box>
          <ViewSwitch me={me} view={view} attributes={attributes} setAttributes={setAttributes} />
        </Box>
      </Box>
    </Box>
  )
}

export default function UserEdit() {
  return (
    <CurrentUser>
    {() => <UserEditInner />}
    </CurrentUser>
  )
}