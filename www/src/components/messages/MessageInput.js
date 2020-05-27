import React, { useRef, useState, useContext, useEffect, useMemo, useCallback } from 'react'
import {socket} from '../../helpers/client'
import TimedCache from '../utils/TimedCache'
import HoveredBackground from '../utils/HoveredBackground'
import { useMutation, useApolloClient } from 'react-apollo'
import { Box, Text, Markdown, Layer, Keyboard, Drop, ThemeContext } from 'grommet'
import { Attachment, Play } from 'grommet-icons'
import { FilePicker } from 'react-file-picker'
import debounce from 'lodash/debounce'
import { CurrentUserContext } from '../login/EnsureLogin'
import { MESSAGE_MUTATION, MESSAGES_Q } from './queries'
import { applyNewMessage } from './utils'
import MentionManager from './MentionManager'
import { ReplyGutter, ReplyContext } from './ReplyProvider'
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import moment from 'moment'
import { plainDeserialize, plainSerialize, isEmpty } from '../../utils/slate'
import { EditingMessageContext } from './VisibleMessages'
import { Conversations } from '../login/MyConversations'
import { useEditor } from '../utils/hooks'
import { Editor, Transforms } from 'slate'
import { SyncLoader } from 'react-spinners'
import { normalizeColor } from 'grommet/utils'
import { edit } from 'ace-builds'


const TEXT_SIZE='xsmall'
const TEXT_COLOR='dark-4'
const SEND_COLOR='status-ok'

function Typing({ignore, typists}) {
  const theme = useContext(ThemeContext)
  let typing = typists.filter((handle) => handle !== ignore)
  const len = typing.length
  if (len === 0) {
    return null
  }
  let text = `${len} people are typing`

  if (len === 1) {
    text = `{typing[0]} is typing`
  } else if (len <= 3) {
    text = `${typing.join(", ")} are typing`
  }

  return (
    <Box direction='row' align='center' gap='xsmall'>
      <Text color={TEXT_COLOR} size={TEXT_SIZE}>{text}</Text>
      <Box pad={{vertical: '2px'}}>
        <SyncLoader size={2} color={normalizeColor('dark-4', theme)} />
      </Box>
    </Box>
  )
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
    <Box
      style={{height: '25px'}} pad={{top: '2px', bottom: '2px'}}
      align='center'
      direction='row'
      fill='horizontal'>
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

function SendMsg({empty, onClick}) {
  return (
    <Box
      style={empty ? null : {cursor: 'pointer'}}
      margin={{horizontal: 'xsmall'}}
      height='30px'
      width="30px"
      round='xxsmall'
      align='center'
      justify='center'
      onClick={empty ? null : onClick}
      background={empty ? null : 'action'} >
      <Play size='15px' color={empty ? 'light-3' : 'white'} />
    </Box>
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
  const empty = isEmpty(editorState)

  const sendMessage = useCallback(() => {
    mutation({variables: {
      conversationId: conversation.id,
      attributes: {attachment, parentId, text: plainSerialize(editorState)}
    }})
    Transforms.select(editor, Editor.start(editor, []))
    setEditorState(plainDeserialize(''))
    setAttachment(null)
  }, [mutation, parentId, editorState, conversation, attachment, setAttachment, editor, setEditorState])

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
            sendMessage()
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
          <SendMsg empty={empty} onClick={sendMessage} />
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