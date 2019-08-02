import React, { Component } from 'react'
import {socket} from '../../helpers/client'
import TimedCache from '../utils/TimedCache'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import {TextInput, Box, Form, Text} from 'grommet'
import debounce from 'lodash/debounce';


const MESSAGE_MUTATION = gql`
  mutation CreateMessage($conversationId: ID!, $text: String!) {
    createMessage(
      conversationId: $conversationId,
      attributes: {text: $text}) {
      id
      text
      insertedAt
      creator {
        name
      }
    }
  }
`

function Typing(props) {
  const size='xsmall'
  const color='dark-4'
  let typists = props.typists.filter((handle) => handle !== props.ignore)
  if (typists.length === 0) {
    return null
  }

  if (typists.length === 1) {
    return <Text color={color} size={size}>{typists[0]} is typing...</Text>
  }

  if (typists.length < 3) {
    return <Text color={color} size={size}>{Array.join(typists, ", ")} are typing...</Text>
  }

  return <Text color={color} size={size}>{typists.length} people are typing...</Text>
}

class MessageInput extends Component {
  state = {
    text: '',
    hover: false,
    typists: []
  }

  componentWillMount() {
    this.channel = socket.channel("conversation:" + this.props.conversation.id)
    this.channel.join()
    this.cache = new TimedCache(2000, (handles) => this.setState({typists: handles}))
    this.channel.on("typing", (msg) => this.cache.add(msg.handle))
    this.interval = setInterval(() => this.channel.push("ping", {who: "cares"}), 10000)
  }

  componentWillUnmount() {
    this.channel.leave()
    this.cache.clear()
  }

  setupChannel() {
    this.channel.leave()
    this.channel = socket.channel("conversation:" + this.props.conversation.id)
    this.channel.join()
  }

  notifyTyping = debounce(() => {
    this.channel.push("typing", {who: "cares"})
  }, 500)

  render() {
    this.setupChannel()
    const { text, hover } = this.state
    return (
      <Box fill='horizontal' pad={{top: '10px', right: '10px', left: '10px'}}>
        <Mutation mutation={MESSAGE_MUTATION} variables={{ conversationId: this.props.conversation.id, text }}>
          {postMutation => (
            <Form onSubmit={postMutation}>
              <Box
                fill='horizontal'
                direction="row"
                align="center"
                border
                round='xsmall'
              >
                <TextInput
                  plain
                  type='text'
                  value={text}
                  onChange={e => {
                    this.notifyTyping()
                    this.setState({ text: e.target.value })
                  }}
                  placeholder="Whatever is on your mind"
                  />
                <Box
                  background={hover ? '#001a0c' : '#004d23'}
                  direction="row"
                  align="center"
                  justify="center"
                  style={{cursor: "pointer"}}
                  width="100px"
                  height="40px"
                  onMouseOver={() => this.setState({hover: true})}
                  onMouseOut={() => this.setState({hover: false})}
                  onClick={postMutation}>
                  <Text size="medium">Send</Text>
                </Box>
              </Box>
            </Form>)}
        </Mutation>
        <Box align='center' justify='start' direction='row'>
          <Typing typists={this.state.typists} ignore={this.props.me.handle} />
        </Box>
      </Box>
    )
  }
}

export default MessageInput