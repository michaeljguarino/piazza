import React, { useRef, useState, useContext, useEffect, useMemo } from 'react'
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
import { plainDeserialize, plainSerialize } from '../../utils/slate'
import { EditingMessageContext } from './VisibleMessages'
import { Conversations } from '../login/MyConversations'
import { useEditor } from '../utils/hooks'
import { Editor, Transforms } from 'slate'


const TEXT_SIZE='xsmall'
const TEXT_COLOR='dark-4'
const SEND_COLOR='status-ok'

function Typing({ignore, typists}) {
  let typing = typists.filter((handle) => handle !== ignore)
  if (typing.length === 0) {
    return null
  }

  if (typing.length === 1) {
    return <Text color={TEXT_COLOR} size={TEXT_SIZE}>{typing[0]} is typing...</Text>
  }

  if (typing.length <= 3) {
    return <Text color={TEXT_COLOR} size={TEXT_SIZE}>{Array.join(typing, ", ")} are typing...</Text>
  }

  return <Text color={TEXT_COLOR} size={TEXT_SIZE}>{typing.length} people are typing...</Text>
}

function HelpDoc() {
  return (
    <Box width="600px" direction='row' justify='end'>
      <Text color={TEXT_COLOR} size={TEXT_SIZE}>
        Use <strong>/command</strong> to issue a command, <strong>@handle</strong> to mention other users, and <Markdown>**Markdown** is _also_ supported!</Markdown>
      </Text>
    </Box>
  )
}

function fetchRecentMessage(cache, setEdited, me, conversation) {
  cache.query({query: MESSAGES_Q, variables: {conversationId: conversation.id}})
    .then(({data: {conversation: {messages: {edges}}}}) => {
      if (edges.length === 0) return
      const {node} = edges[0]
      if (node.creator.id === me.id) setEdited(node.id)
    })
}

function InputFooter({typists, me: {handle}}) {
  return (
    <Box style={{height: '20px'}} pad={{top: '2px', bottom: '2px'}} align='center' direction='row' fill='horizontal'>
      <div style={{width: 'calc(100% - 600px)'}}>
        <Typing typists={typists} ignore={handle} />
      </div>
      <HelpDoc/>
    </Box>
  )
}

function FileInput({attachment, setAttachment}) {
  return (
    <HoveredBackground>
      <Box accentable style={{cursor: "pointer"}}>
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
  )
}

function MessageInputInner({editor, attachment, setAttachment, conversation, setWaterline, typists, notifyTyping, dropRef}) {
  const [editorState, setEditorState] = useState(plainDeserialize(''))
  const [uploadProgress, setUploadProgress] = useState(null)
  const [disableSubmit, setDisableSubmit] = useState(false)
  const {setEdited} = useContext(EditingMessageContext)
  const {reply, setReply} = useContext(ReplyContext)
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
      ref={dropRef}
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
      <Keyboard
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !disableSubmit) {
            mutation({variables: {
              conversationId: conversation.id,
              attributes: {attachment, parentId, text: plainSerialize(editorState)}
            }})
            Transforms.select(editor, Editor.start(editor, []))
            setEditorState(plainDeserialize(''))
            setAttachment(null)
            e.preventDefault()
          }
        }}
        onUp={() => (
          plainSerialize(editorState) === '' && fetchRecentMessage(
            cache,  setEdited, me, conversation)
        )}>
        <Box
          border
          fill='horizontal'
          height='calc(100%-20px)'
          direction="row"
          align="center"
          round='xsmall'>
          <MentionManager
            parentRef={boxRef}
            editor={editor}
            editorState={editorState}
            setEditorState={setEditorState}
            disableSubmit={setDisableSubmit}
            clearable={!disableSubmit}
            onChange={notifyTyping} />
          <FileInput attachment={attachment} setAttachment={setAttachment} />
        </Box>
      </Keyboard>
      <InputFooter typists={typists} me={me} />
    </Box>
  )
}

export default function MessageInput(props) {
  const dropRef = useRef()
  const {reply, setReply} = useContext(ReplyContext)
  const {currentConversation, setWaterline} = useContext(Conversations)
  const [typists, setTypists] = useState([])
  const [channel, setChannel] = useState(null)
  const cache = useMemo(() => new TimedCache(2000, setTypists), [])
  const id = currentConversation.id
  const editor = useEditor()
  useEffect(() => {
    const channel = socket.channel(`conversation:${id}`)
    setChannel(channel)
    channel.join()
    channel.on("typing", (msg) => cache.add(msg.handle))

    return () => channel.leave()
  }, [id])

  const notifyTyping = debounce(() => {
    channel && channel.push("typing", {who: "cares"})
  }, 500, {leading: true})

  return (
    <>
    {reply && (
      <Drop target={dropRef.current} align={{bottom: 'top'}}>
        <ReplyGutter reply={reply} setReply={setReply} {...props} />
      </Drop>
    )}
    <MessageInputInner
      conversation={currentConversation}
      setWaterline={setWaterline}
      dropRef={dropRef}
      typists={typists}
      notifyTyping={notifyTyping}
      editor={editor}
      setReply={setReply}
      {...props} />
    </>
  )
}