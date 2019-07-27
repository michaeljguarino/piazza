import React, { Component } from 'react'
import {Box, Text} from 'grommet'
import Avatar from './Avatar'

class Me extends Component {
  render() {
    return (
      <Box height='40px' margin={{bottom: 'large', top: '10px'}} pad={this.props.pad} direction='row'>
        <Avatar user={this.props.me} rightMargin='10px' />
        <Box>
          <Text size='small' weight='bold'>{"@" + this.props.me.handle}</Text>
          <Text size='small' color='dark-6'>{this.props.me.name}</Text>
        </Box>
      </Box>
    )
  }
}

export default Me