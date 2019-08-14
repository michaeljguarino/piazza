import React, { Component, createRef } from 'react'
import {socket} from '../../helpers/client'
import TimedCache from '../utils/TimedCache'
import { Mutation } from 'react-apollo'
import {Box, Form, Text, Markdown} from 'grommet'
import {Attachment} from 'grommet-icons'
import {FilePicker} from 'react-file-picker'
import debounce from 'lodash/debounce'
import {CurrentUserContext} from '../login/EnsureLogin'
import {MESSAGE_MUTATION, MESSAGES_Q} from './queries'
import {applyNewMessage} from './utils'
import MentionManager from './MentionManager'


const TEXT_SIZE='xsmall'
const TEXT_COLOR='dark-4'
const SEND_COLOR='#004d23'

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
    typists: []
  }

  boxRef = createRef()

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
    const { text, attachment } = this.state
    return (
      <Box fill='horizontal' pad={{top: '10px', right: '10px', left: '10px'}}>
        <Mutation
            mutation={MESSAGE_MUTATION}
            variables={{ conversationId: this.props.conversation.id, attributes: {text, attachment}}}
            update={(cache, {data: {createMessage}}) => {
              const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: this.props.conversation.id}})
              cache.writeQuery({
                query: MESSAGES_Q,
                variables: {conversationId: this.props.conversation.id},
                data: applyNewMessage(data, createMessage)
              })
            }}
        >
        {postMutation => (
          <Form onSubmit={() => {
            postMutation()
            this.setState({attachment: null})
          }}>
            <Box
              fill='horizontal'
              direction="row"
              align="center"
              border
              round='xsmall'
            >
              <FilePicker
                onChange={ (file) => this.setState({attachment: file})}
                maxSize={2000}
                onError={(msg) => console.log(msg)}
              >
                <Box
                  style={{cursor: "pointer"}}
                  align='center'
                  justify='center'
                  border="right"
                  height='40px'
                  width="40px">
                  <Attachment color={this.state.attachment ? SEND_COLOR : null} size='15px' />
                </Box>
              </FilePicker>
              <MentionManager
                parentRef={this.boxRef}
                onChange={text => {
                  this.notifyTyping()
                  this.setState({ text: text })
                }} />
            </Box>
          </Form>
          )
        }
        </Mutation>
        <Box align='center' direction='row' fill='horizontal'>
          <div style={{width: 'calc(100% - 600px)'}}>
            <CurrentUserContext.Consumer>
              {me => (<Typing typists={this.state.typists} ignore={me.handle} />)}
            </CurrentUserContext.Consumer>
          </div>
          <HelpDoc/>
        </Box>
      </Box>
    )
  }
}

export default MessageInput