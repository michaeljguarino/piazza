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
        <Box margin={{bottom: 'medium'}}>
          <ConversationCreator
            padding={padding}
            textColor={textColor}
            setCurrentConversation={this.props.setCurrentConversation} />
          <Scroller
            id='conversations-list'
            style={{
              overflow: 'auto',
              height: '40vh'
            }}
            edges={this.props.conversations}
            onLoadMore={() => console.log('end of convs')}
            mapper={(edge) => <Conversation
              pad={padding}
              color={textColor}
              key={edge.node.id}
              currentConversation={this.props.currentConversation}
              setCurrentConversation={this.props.setCurrentConversation}
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