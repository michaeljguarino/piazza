import React, { Component, useRef, useState, useContext } from 'react'
import {socket} from '../../helpers/client'
import TimedCache from '../utils/TimedCache'
import HoveredBackground from '../utils/HoveredBackground'
import { useMutation, useApolloClient } from 'react-apollo'
import {Box, Text, Markdown, Layer, Keyboard, Drop} from 'grommet'
import {Attachment} from 'grommet-icons'
import {FilePicker} from 'react-file-picker'
import debounce from 'lodash/debounce'
import {CurrentUserContext} from '../login/EnsureLogin'
import {MESSAGE_MUTATION, MESSAGES_Q} from './queries'
import {applyNewMessage} from './utils'
import MentionManager from './MentionManager'
import {ReplyGutter, ReplyContext} from './ReplyProvider'
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import moment from 'moment'
import Plain from 'slate-plain-serializer'
import { EditingMessageContext } from './VisibleMessages'
import { Conversations } from '../login/MyConversations'


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

  if (typists.length <= 3) {
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

class MessageInputLifecycleManager extends Component {
  state = {
    typists: []
  }

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

  componentDidUpdate() {
    this.setupChannel()
  }

  setupChannel() {
    const newTopic = "conversation:" + this.props.conversation.id
    if (newTopic !== this.topic) {
      this.topic = newTopic
      this.channel.leave()
      this.channel = socket.channel(this.topic)
      this.channel.join()
      this.channel.on("typing", (msg) => this.cache.add(msg.handle))
    }
  }

  notifyTyping = debounce(() => {
    this.channel.push("typing", {who: "cares"})
  }, 500, {leading: true})

  render() {
    return this.props.children({notifyTyping: this.notifyTyping, typists: this.state.typists})
  }
}

function fetchRecentMessage(cache, setEdited, me, conversation) {
  cache.query({query: MESSAGES_Q, variables: {conversationId: conversation.id}})
    .then(({data: {conversation: {messages: {edges}}}}) => {
      if (edges.length === 0) return
      const {node} = edges[0]
      if (node.creator.id === me.id) setEdited(node.id)
    })
}

function MessageInput({attachment, setAttachment, reply, setReply, conversation, setWaterline, ...props}) {
  const [editorState, setEditorState] = useState(Plain.deserialize(''))
  const [uploadProgress, setUploadProgress] = useState(null)
  const [disableSubmit, setDisableSubmit] = useState(false)
  const {setEdited} = useContext(EditingMessageContext)
  const me = useContext(CurrentUserContext)
  const cache = useApolloClient()

  const [mutation] = useMutation(MESSAGE_MUTATION, {
    context: {fetchOptions: {
      useUpload: !!attachment,
      onProgress: (ev) => setUploadProgress(Math.round((ev.loaded / ev.total) * 100)),
      onAbortPossible: () => null
    }},
    update: (cache, {data: {createMessage}}) => {
      const data = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: conversation.id}})
      cache.writeQuery({
        query: MESSAGES_Q,
        variables: {conversationId: conversation.id},
        data: applyNewMessage(data, createMessage)
      })
      setUploadProgress(null)
      setReply(null)
      setWaterline(moment().add(5, 'minutes').toISOString())
    }
  })

  const boxRef = useRef()
  const parentId = reply && reply.id

  return (
    <Box
      ref={props.dropRef}
      style={{maxHeight: '210px', minHeight: 'auto'}}
      fill='horizontal'
      pad={{horizontal: '10px'}}>
      {uploadProgress && (
        <Layer plain modal={false} position='bottom'>
          <Box width='400px'>
            <Progress
              percent={uploadProgress}
              status={uploadProgress === 100 ? 'success' : 'active'} />
          </Box>
        </Layer>
      )}
      <Keyboard onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !disableSubmit) {
          mutation({variables: {
            conversationId: conversation.id,
            attributes: {attachment, parentId, text: Plain.serialize(editorState)}
          }})
          setEditorState(Plain.deserialize(''))
          setAttachment(null)
        }
      }} onUp={() => {
        if (Plain.serialize(editorState) !== '') return
        fetchRecentMessage(cache, setEdited, me, conversation)
      }}>
        <Box
          border
          fill='horizontal'
          height='calc(100%-20px)'
          direction="row"
          align="center"
          round='xsmall'>
          <MentionManager
            parentRef={boxRef}
            editorState={editorState}
            setEditorState={(editorState) => setEditorState(editorState)}
            disableSubmit={setDisableSubmit}
            clearable={!disableSubmit}
            onChange={() => props.notifyTyping()} />
          <HoveredBackground>
            <Box
              accentable
              style={{cursor: "pointer"}}>
              <FilePicker
                onChange={(file) => setAttachment(file)}
                maxSize={2000}
                onError={(msg) => console.log(msg)}
              >
                <Box
                  align='center'
                  justify='center'
                  height='40px'
                  width="30px">
                  <Attachment color={attachment ? SEND_COLOR : null} size='15px' />
                </Box>
              </FilePicker>
            </Box>
          </HoveredBackground>
        </Box>
      </Keyboard>
      <Box style={{height: '20px'}} pad={{top: '2px', bottom: '2px'}} align='center' direction='row' fill='horizontal'>
        <div style={{width: 'calc(100% - 600px)'}}>
          <CurrentUserContext.Consumer>
            {me => (<Typing typists={props.typists} ignore={me.handle} />)}
          </CurrentUserContext.Consumer>
        </div>
        <HelpDoc/>
      </Box>
    </Box>
  )
}

function WrappedMessageInput(props) {
  const dropRef = useRef()
  const {reply, setReply} = useContext(ReplyContext)
  const {currentConversation, setWaterline} = useContext(Conversations)

  return (
    <>
    {reply && (
      <Drop target={dropRef.current} align={{bottom: 'top'}}>
        <ReplyGutter reply={reply} setReply={setReply} {...props} />
      </Drop>
    )}
    <MessageInputLifecycleManager conversation={currentConversation} {...props}>
    {({typists, notifyTyping}) => (
      <MessageInput
        conversation={currentConversation}
        setWaterline={setWaterline}
        dropRef={dropRef}
        typists={typists}
        notifyTyping={notifyTyping}
        {...props} />
      )}
    </MessageInputLifecycleManager>
    </>
  )
}

export default WrappedMessageInput