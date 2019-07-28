import React, { Component } from 'react'
import {Box, Text, Markdown} from 'grommet'
import {Robot} from 'grommet-icons'
import Avatar from '../users/Avatar'
import moment from 'moment'
import MessageEmbed from './MessageEmbed'

function TextMessage(props) {
  return (
    <Text size='xsmall'>
      <Markdown>{props.text}</Markdown>
    </Text>
  )
}

class Message extends Component {
  render() {
    let date = moment(this.props.message.insertedAt)
    return (
      <Box flex={false} direction='row' margin={{left: 'small', top: '10px'}}>
        <Avatar user={this.props.message.creator} />
        <Box>
          <Box direction='row' align='center'>
            <Text weight='bold' size='15px' margin={{right: '5px'}}>
              {this.props.message.creator.name}
            </Text>
            {this.props.message.creator.bot && (
              <Text margin={{right: '5px'}}><Robot size='15px'/></Text>
            )}
            <Text size='10px'>
              {date.fromNow()}
            </Text>
          </Box>
          <Box>
            {this.props.message.embed ?
              <MessageEmbed {...this.props.message.embed} /> :
              <TextMessage {...this.props.message} />
            }
          </Box>
        </Box>
      </Box>
    )
  }
}

export default Message