import React, { Component } from 'react'

class Conversation extends Component {
  render() {
    return (
      <div>
        <div>
          {this.props.conversation.name}
        </div>
      </div>
    )
  }
}

export default Conversation