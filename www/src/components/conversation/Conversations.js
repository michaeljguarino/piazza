import React, { Component } from 'react'
import Conversation from './Conversation'

class Conversations extends Component {
  render() {
    return (
      <div>
        {this.props.conversations.map(edge => <Conversation key={edge.node.id} conversation={edge.node} />)}
      </div>
    )
  }
}

export default Conversations