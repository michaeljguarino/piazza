import React, { Component } from 'react'
import {Box, Text} from 'grommet'
import Avatar from '../users/Avatar'
import moment from 'moment'

class Message extends Component {
  render() {
    let date = moment(this.props.message.insertedAt)
    console.log(date)
    return (
      <Box flex={false} direction='row' margin={{left: 'small', top: '10px'}}>
        <Avatar user={this.props.message.creator} />
        <Box>
          <Box direction='row' align='center'>
            <Text weight='900' size='15px' margin={{right: '5px'}}>
              {this.props.message.creator.name}
            </Text>
            <Text size='10px' weight='400'>
              {date.fromNow()}
            </Text>
          </Box>
          <Box>
            <Text size='xsmall'>{this.props.message.text}</Text>
          </Box>
        </Box>
      </Box>
    )
  }
}

export default Message