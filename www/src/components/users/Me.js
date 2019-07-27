import React, {Component } from 'react'
import {Box, Text, Anchor} from 'grommet'
import Avatar from './Avatar'
import Dropdown from '../utils/Dropdown'
import {AUTH_TOKEN} from '../../constants'

class Me extends Component {
  state = {};

  _logout = () => {
    localStorage.removeItem(AUTH_TOKEN)
    window.location.href = "/login"
  }

  render() {
    return (
      <Dropdown>
        <Box style={{cursor: 'pointer'}} height='40px' margin={{bottom: 'large', top: '10px'}} pad={this.props.pad} direction='row'>
          <Avatar user={this.props.me} rightMargin='10px' />
          <Box>
            <Text size='small' weight='bold'>{"@" + this.props.me.handle}</Text>
            <Text size='small' color='dark-6'>{this.props.me.name}</Text>
          </Box>
        </Box>
        <Box pad={{left: '20px', top: "20px", bottom: "20px"}} width="200px" gap='small'>
          <Box direction="row">
            <Avatar user={this.props.me} rightMargin='10px' />
            <Text size="medium" weight='bold'>{this.props.me.name}</Text>
          </Box>
          <Anchor onClick={this._logout}>
            logout
          </Anchor>
        </Box>
      </Dropdown>
    )
  }
}

export default Me