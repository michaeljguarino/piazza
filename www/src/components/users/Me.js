import React, {Component } from 'react'
import {Box, Text, Anchor} from 'grommet'
import Avatar from './Avatar'
import { Mutation } from 'react-apollo'
import Dropdown from '../utils/Dropdown'
import {AUTH_TOKEN} from '../../constants'
import { FilePicker } from 'react-file-picker'
import {ME_Q, UPDATE_USER} from './queries'

class Me extends Component {
  state = {};

  _logout = () => {
    localStorage.removeItem(AUTH_TOKEN)
    window.location.href = "/login"
  }

  render() {
    return (
      <Box style={{cursor: 'pointer'}} height='40px' margin={{bottom: 'large', top: '10px'}} pad={this.props.pad} direction='row'>
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
                onChange={ (file) => mutate({variables: {id: this.props.me.id, attributes: {avatar: file}}})}
              >
                <span><Avatar user={this.props.me} rightMargin='10px' /></span>
              </FilePicker>
            )}
          </Mutation>
          <Dropdown>
            <Box>
              <Text size='small' weight='bold'>{"@" + this.props.me.handle}</Text>
              <Text size='small' color='dark-6'>{this.props.me.name}</Text>
            </Box>
            <Box pad={{left: '20px', top: "20px", bottom: "20px"}} width="200px" gap='small'>
              <Box direction="row" align="center">
                <Avatar user={this.props.me} rightMargin='10px' />
                <Text size="small" weight='bold'>{this.props.me.name}</Text>
              </Box>
              <Anchor onClick={this._logout}>
                logout
              </Anchor>
            </Box>
          </Dropdown>
        </Box>
      </Box>
    )
  }
}

export default Me