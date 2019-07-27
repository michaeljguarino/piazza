import React, { Component } from 'react'
import {Box, Text} from 'grommet'

const background='#ff7b25'

class Message extends Component {
  render() {
    return (
      <Box flex={false} direction='row' margin={{left: 'small', bottom: '10px'}}>
        <Box
          border={{style: 'hidden'}}
          round='xsmall'
          background={this.props.message.creator.backgroundColor || background}
          align='center'
          justify='center'
          width='30px'
          margin={{right: '5px'}}>
          <Text>{this.props.message.creator.handle.charAt(0).toUpperCase()}</Text>
        </Box>
        <Box>
          <Box>
            <Text weight='bold' size='xsmall'>
              {this.props.message.creator.name}
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