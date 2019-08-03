import React, { Component } from 'react'
import {socket} from '../../helpers/client'
import TimedCache from '../utils/TimedCache'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import {TextInput, Box, Form, Text, Markdown} from 'grommet'
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

const TEXT_SIZE='xsmall'
const TEXT_COLOR='dark-4'

function Typing(props) {
  let typists = props.typists.filter((handle) => handle !== props.ignore)
  if (typists.length === 0) {
    return null
  }

  if (typists.length === 1) {
    return <Text color={TEXT_COLOR} size={TEXT_SIZE}>{typists[0]} is typing...</Text>
  }

  if (typists.length < 3) {
    return <Text color={TEXT_COLOR} size={TEXT_SIZE}>{Array.join(typists, ", ")} are typing...</Text>
  }

  return <Text color={TEXT_COLOR} size={TEXT_SIZE}>{typists.length} people are typing...</Text>
}

function HelpDoc(props) {
  return (
    <Box width="600px" direction='row' justify='end'>
      <Text color={TEXT_COLOR} size={TEXT_SIZE}>
        Use <strong>/command</strong> to issue a command, <strong>@handle</strong> to mention other users, and <Markdown>**Markdown** is _also_ supported!</Markdown>
      </Text>
    </Box>
  )
}

class MessageInput extends Component {
  state = {
    text: '',
    hover: false,
    typists: []
  }

  componentWillMount() {
    this.topic = "conversation:" + this.props.conversation.id
    this.channel = socket.channel(this.topic)
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
    const newTopic = "conversation:" + this.props.conversation.id
    if (newTopic !== this.topic) {
      this.topic = newTopic
      this.channel.leave()
      this.channel = socket.channel(this.topic)
      this.channel.join()
    }
  }

  notifyTyping = debounce(() => {
    this.channel.push("typing", {who: "cares"})
  }, 500, {leading: true})

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
        <Box align='center' direction='row' fill='horizontal'>
          <div style={{width: 'calc(100% - 600px)'}}>
            <Typing typists={this.state.typists} ignore={this.props.me.handle} />
          </div>
          <HelpDoc/>
        </Box>
      </Box>
    )
  }
}

export default MessageInput