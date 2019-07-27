import React, { Component } from 'react'
import {Box} from 'grommet'

class Conversation extends Component {
  render() {
    return (
      <Box margin='small'>
        {this.props.conversation.name}
      </Box>
    )
  }
}

export default Conversation