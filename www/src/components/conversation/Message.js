import React, { Component } from 'react'

class Message extends Component {
  render() {
    return (
      <div>
        <div>
          {this.props.message.user.name} -- {this.props.message.insertedAt} -- ({this.props.message.text})
        </div>
      </div>
    )
  }
}

export default Message