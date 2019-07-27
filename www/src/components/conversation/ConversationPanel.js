import React, { Component } from 'react'
import Conversation from './Conversation'
import Me from '../users/Me'
import Users from '../users/Users'
import Commands from '../commands/Commands'
import {Box} from 'grommet'
import ConversationCreator from './ConversationCreator'
import Scroller from '../Scroller'

class ConversationPanel extends Component {
  render() {
    let padding = {left: '10px'}
    let textColor = 'dark-6'
    return (
      <Box>
        <Me me={this.props.me} pad={padding} />
        <Box margin={{bottom: 'large'}}>
          <ConversationCreator padding={padding} textColor={textColor} />
          <Scroller
              id='conversations-list'
              style={{
                overflow: 'auto',
                height: '30vh'
              }}
              edges={this.props.conversations}
              onLoadMore={() => console.log('end of conversations')}
              mapper={(edge) => <Conversation
                pad={padding}
                color={textColor}
                key={edge.node.id}
                currentConversation={this.props.currentConversation}
                conversation={edge.node} />
              } />
        </Box>
        <Users pad={padding} color={textColor} />
        <Commands pad={padding} color={textColor} />
      </Box>
    )
  }
}

export default ConversationPanel