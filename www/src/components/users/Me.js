import React, {Component, useState} from 'react'
import {Box, Text} from 'grommet'
import Avatar from './Avatar'
import { Mutation } from 'react-apollo'
import Dropdown from '../utils/Dropdown'
import Modal from '../utils/Modal'
import {AUTH_TOKEN} from '../../constants'
import { FilePicker } from 'react-file-picker'
import {ME_Q, UPDATE_USER} from './queries'
import {CurrentUserContext} from '../login/EnsureLogin'
import UpdatePassword from './UpdatePassword'
import UpdateProfile from './UpdateProfile'

function DropdownItem(props) {
  const [background, setBackground] = useState(null)

  return (
    <Box
      style={{cursor: 'pointer'}}
      pad={{bottom: 'xsmall', left: 'small', right: 'small'}}
      background={background}
      onClick={() => props.onClick && props.onClick()}
      onMouseEnter={() => setBackground('brand')}
      onMouseLeave={() => setBackground(null)}>
      <Text size='small'>{props.text}</Text>
    </Box>
  )
}

class Me extends Component {
  state = {};

  _logout = () => {
    localStorage.removeItem(AUTH_TOKEN)
    window.location.href = "/login"
  }

  render() {
    return (
      <CurrentUserContext.Consumer>
      {me =>
        (<Box style={{cursor: 'pointer'}} height='40px' margin={{bottom: 'large', top: '10px'}} pad={this.props.pad} direction='row'>
          <Box direction='row' margin={{bottom: '5px'}}>
            <Mutation
              mutation={UPDATE_USER}
              update={(cache, { data: { updateUser } }) => {
                const {me} = cache.readQuery({ query: ME_Q });
                const newData = {
                  me: {
                    ...me,
                    ...updateUser
                }}
                cache.writeQuery({
                  query: ME_Q,
                  data: newData
                });
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
            <Dropdown>
              <Box>
                <Text size='small' weight='bold'>{"@" + me.handle}</Text>
                <Text size='small' color='dark-6'>{me.name}</Text>
              </Box>
              <Box width="200px">
                <Box pad='small' direction="row" align="center">
                  <Avatar user={me} rightMargin='10px' />
                  <Text size="small" weight='bold'>{me.name}</Text>
                </Box>
                <Box gap='xsmall' pad={{top: 'xsmall', bottom: 'small'}}>
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
                <Box border='top' pad={{top: 'xsmall', bottom: 'xsmall'}}>
                  <DropdownItem text='logout' onClick={this._logout} />
                </Box>
              </Box>
            </Dropdown>
          </Box>
        </Box>
      )}
      </CurrentUserContext.Consumer>
    )
  }
}

export default Me