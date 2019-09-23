import React, { Component, createRef, useRef } from 'react'
import {socket} from '../../helpers/client'
import TimedCache from '../utils/TimedCache'
import HoveredBackground from '../utils/HoveredBackground'
import { Mutation } from 'react-apollo'
import {Box, Text, Markdown, Layer, Keyboard, Drop} from 'grommet'
import {Attachment} from 'grommet-icons'
import {FilePicker} from 'react-file-picker'
import debounce from 'lodash/debounce'
import {CurrentUserContext} from '../login/EnsureLogin'
import {MESSAGE_MUTATION, MESSAGES_Q} from './queries'
import {applyNewMessage} from './utils'
import MentionManager from './MentionManager'
import {ReplyGutter} from './ReplyProvider'
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";



const TEXT_SIZE='xsmall'
const TEXT_COLOR='dark-4'
const SEND_COLOR='status-ok'

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
    typists: [],
    uploadProgress: null,
    useUpload: false,
    disableSubmit: false
  }

  boxRef = createRef()

  componentWillMount() {
    this.topic = "conversation:" + this.props.conversation.id
    this.channel = socket.channel(this.topic)
    this.channel.join()
    this.cache = new TimedCache(2000, (handles) => this.setState({typists: handles}))
    this.channel.on("typing", (msg) => this.cache.add(msg.handle))
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

  handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.shiftKey) return
  }

  notifyTyping = debounce(() => {
    this.channel.push("typing", {who: "cares"})
  }, 500, {leading: true})

  render() {
    this.setupChannel()
    const { text, attachment } = this.state
    const parentId = this.props.reply && this.props.reply.id
    return (
      <Box 
        ref={this.props.dropRef}
        style={{maxHeight: '210px', minHeight: 'auto'}} 
        fill='horizontal' 
        pad={{horizontal: '10px'}}>
        {this.state.uploadProgress && (
          <Layer plain modal={false} position='bottom'>
            <Box width='400px'>
              <Progress
                percent={this.state.uploadProgress}
                status={this.state.uploadProgress === 100 ? 'success' : 'active'} />
            </Box>
          </Layer>
        )}
        <Mutation
            mutation={MESSAGE_MUTATION}
            variables={{conversationId: this.props.conversation.id, attributes: {text, attachment, parentId}}}
            context= {{
              fetchOptions: {
                useUpload: this.state.useUpload,
                onProgress: (ev) => {
                  this.setState({uploadProgress: Math.round((ev.loaded / ev.total) * 100)});
                },
                onAbortPossible: () => null
              }
            }}
            update={(cache, {data: {createMessage}}) => {
              const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: this.props.conversation.id}})
              cache.writeQuery({
                query: MESSAGES_Q,
                variables: {conversationId: this.props.conversation.id},
                data: applyNewMessage(data, createMessage)
              })
              this.setState({uploadProgress: null})
              this.props.setReply(null)
            }}
        >
        {postMutation => (
          <Keyboard onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !this.state.disableSubmit) {
                postMutation()
                this.setState({attachment: null, text: ''})
                this.props.resetHeight()
              } else if (e.key === 'Enter' && e.shiftKey) {
                this.props.incrementHeight()
              }
            }}>
            <Box
              border
              fill='horizontal'
              height='calc(100%-20px)'
              direction="row"
              align="center"
              round='xsmall'>
              <MentionManager
                parentRef={this.boxRef}
                text={this.state.text}
                setText={(text) => this.setState({ text: text })}
                disableSubmit={(disable) => this.setState({disableSubmit: disable})}
                submitDisabled={this.state.disableSubmit}
                onChange={() => this.notifyTyping()} />
              <HoveredBackground>
                <Box
                  accentable
                  style={{cursor: "pointer"}}>
                  <FilePicker
                    onChange={(file) => this.setState({useUpload: true, attachment: file})}
                    maxSize={2000}
                    onError={(msg) => console.log(msg)}
                  >
                    <Box 
                      align='center'
                      justify='center'
                      height='40px'
                      width="30px">
                      <Attachment color={this.state.attachment ? SEND_COLOR : null} size='15px' />
                    </Box>
                  </FilePicker>
                </Box>
              </HoveredBackground>
            </Box>
          </Keyboard>
        )}
        </Mutation>
        <Box style={{height: '20px'}} pad={{top: '2px', bottom: '2px'}} align='center' direction='row' fill='horizontal'>
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

function WrappedMessageInput(props) {
  const dropRef = useRef()

  return (
    <>
      {props.reply && (
        <Drop target={dropRef.current} align={{bottom: 'top'}}>
          <ReplyGutter {...props}/>
        </Drop>
      )}
      <MessageInput dropRef={dropRef} {...props} />
    </>
  )
}

export default WrappedMessageInput