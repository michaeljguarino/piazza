import React from 'react'
import {Box, Text, ThemeContext} from 'grommet'
import Avatar from './Avatar'
import { Mutation } from 'react-apollo'
import CloseableDropdown from '../utils/CloseableDropdown'
import Modal, {ModalHeader} from '../utils/Modal'
import {AUTH_TOKEN} from '../../constants'
import MenuItem, {SubMenu} from '../utils/MenuItem'
import InterchangeableBox from '../utils/InterchangeableBox'
import HoveredBackground from '../utils/HoveredBackground'
import { FilePicker } from 'react-file-picker'
import {ME_Q, UPDATE_USER} from './queries'
import {CurrentUserContext} from '../login/EnsureLogin'
import UpdatePassword from './UpdatePassword'
import UpdateProfile from './UpdateProfile'
import StructuredMessageTester from '../tools/StructuredMessageTester'

export function DropdownItem(props) {
  const {onClick, ...rest} = props
  return (
    <MenuItem onClick={() => onClick && onClick()} {...rest}>
      <Text size='small'>{props.text}</Text>
    </MenuItem>
  )
}

const _logout = () => {
  localStorage.removeItem(AUTH_TOKEN)
  window.location.href = "/login"
}

function Me(props) {
  return (
    <ThemeContext.Extend value={{layer: {zIndex: 25}}}>
      <CurrentUserContext.Consumer>
      {me =>
        (
        <HoveredBackground>
          <Box
            brandHover
            accentText
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
                  <Text size='small' color='dark-6'>{me.name}</Text>
                </Box>
              }>
              {setDropdownOpen => (
                <Box width="200px">
                  <Box pad='small' direction="row" align="center">
                    <Avatar user={me} rightMargin='10px' />
                    <Text size="small" weight='bold'>{me.name}</Text>
                  </Box>
                  <InterchangeableBox>
                  {setAlternate => (
                    <>
                    <Modal target={<DropdownItem text='update profile' />}>
                    {setOpen => (
                      <Box>
                        <ModalHeader text='Update Profile' setOpen={setOpen} />
                        <Box gap='small' pad="medium" width='300px'>
                          <UpdateProfile callback={() => setOpen(false)} me={me} />
                        </Box>
                      </Box>
                    )}
                    </Modal>
                    <Modal target={<DropdownItem text='change password' />}>
                      {setOpen => (
                        <Box width='400px'>
                          <ModalHeader text='Update Password' setOpen={setOpen} />
                          <Box gap='small' pad="medium">
                            <UpdatePassword callback={() => setOpen(false)} me={me} />
                          </Box>
                        </Box>
                      )}
                    </Modal>
                    <SubMenu text='developer tools' setAlternate={setAlternate}>
                       <Modal target={<DropdownItem text='structured message creator' />}>
                        {setOpen => (
                          <Box>
                            <ModalHeader text='Structured Message Developer' setOpen={setOpen} />
                            <StructuredMessageTester callback={() => setOpen(false)} />
                          </Box>
                        )}
                      </Modal>
                    </SubMenu>
                    <Box border='top'>
                      <DropdownItem pad={{horizontal: 'small', vertical: 'small'}} text='logout' onClick={_logout} />
                    </Box>
                    </>
                  )}
                  </InterchangeableBox>
                </Box>
              )}
              </CloseableDropdown>
            </Box>
          </Box>
        </HoveredBackground>
      )}
      </CurrentUserContext.Consumer>
    </ThemeContext.Extend>
  )
}

export default Me