import React, {useState} from 'react'
import {Box, Text, ThemeContext} from 'grommet'
import Avatar from './Avatar'
import { Mutation } from 'react-apollo'
import CloseableDropdown from '../utils/CloseableDropdown'
import Modal from '../utils/Modal'
import {AUTH_TOKEN} from '../../constants'
import { FilePicker } from 'react-file-picker'
import {ME_Q, UPDATE_USER} from './queries'
import {CurrentUserContext} from '../login/EnsureLogin'
import UpdatePassword from './UpdatePassword'
import UpdateProfile from './UpdateProfile'
import StructuredMessageTester from '../tools/StructuredMessageTester'

function DropdownItem(props) {
  const [hover, setHover] = useState(false)

  return (
    <Box
      style={{cursor: 'pointer'}}
      pad={{bottom: 'xsmall', left: 'small', right: 'small'}}
      background={hover ? 'brand' : null}
      onClick={() => props.onClick && props.onClick()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <Text size='small'>{props.text}</Text>
    </Box>
  )
}

const _logout = () => {
  localStorage.removeItem(AUTH_TOKEN)
  window.location.href = "/login"
}

function Me(props) {
  const [hover, setHover] = useState(false)
  return (
    <ThemeContext.Extend value={{layer: {zIndex: 25}}}>
      <CurrentUserContext.Consumer>
      {me =>
        (<Box
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          background={hover ? 'brand-heavy' : null}
          style={{cursor: 'pointer'}}
          pad={{...props.pad, top: 'small', bottom: '7px'}}
          align='center'
          direction='row'>
          <Box direction='row' align='center' margin={{bottom: '5px'}}>
            <Mutation
              mutation={UPDATE_USER}
              update={(cache, { data: { updateUser } }) => {
                const {me} = cache.readQuery({ query: ME_Q });
                cache.writeQuery({query: ME_Q, data: {me: {...me, ...updateUser}}});
              }} >
              {mutate => (
                <FilePicker
                  extensions={['jpg', 'jpeg', 'png']}
                  dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
                  onChange={ (file) => mutate({variables: {id: me.id, attributes: {avatar: file}}})}
                >
                  <span><Avatar user={me} rightMargin='10px' /></span>
                </FilePicker>
              )}
            </Mutation>
            <CloseableDropdown target={
              <Box>
                <Text size='small' weight='bold'>{"@" + me.handle}</Text>
                <Text size='small' color={hover ? 'white' : 'dark-6'}>{me.name}</Text>
              </Box>
            }>
            {setDropdownOpen => (
              <Box width="200px">
                <Box pad='small' direction="row" align="center">
                  <Avatar user={me} rightMargin='10px' />
                  <Text size="small" weight='bold'>{me.name}</Text>
                </Box>
                <Box gap='xsmall' pad={{vertical: 'small'}}>
                  <Modal target={<DropdownItem text='update profile' />}>
                    {setOpen => (
                      <Box gap='small' pad="medium" width='300px'>
                        <UpdateProfile callback={() => setOpen(false)} me={me} />
                      </Box>
                    )}
                  </Modal>
                  <Modal target={<DropdownItem text='change password' />}>
                    {setOpen => (
                      <Box gap='small' pad="medium" width='300px'>
                        <UpdatePassword callback={() => setOpen(false)} me={me} />
                      </Box>
                    )}
                  </Modal>
                </Box>
                <Box border='top' pad={{vertical: 'xsmall'}}>
                  <Modal target={<DropdownItem text='structured message creator' />}>
                  {setOpen => (
                    <StructuredMessageTester callback={() => setOpen(false)} />
                  )}
                  </Modal>
                </Box>
                <Box border='top' pad={{vertical: 'xsmall'}}>
                  <DropdownItem text='logout' onClick={_logout} />
                </Box>
              </Box>
            )}
            </CloseableDropdown>
          </Box>
        </Box>
      )}
      </CurrentUserContext.Consumer>
    </ThemeContext.Extend>
  )
}

export default Me