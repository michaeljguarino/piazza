import React, { useRef, useState, useContext, useEffect, useMemo, useCallback } from 'react'
import { HoveredBackground } from 'forge-core'
import { socket } from '../../helpers/client'
import TimedCache from '../utils/TimedCache'
import { useMutation, useApolloClient } from 'react-apollo'
import { Box, Text, Markdown, Layer, Keyboard, Drop, ThemeContext, Stack } from 'grommet'
import { Attachment, Close } from 'grommet-icons'
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
import { MoonLoader, SyncLoader } from 'react-spinners'
import { normalizeColor } from 'grommet/utils'
import { SendNew } from '../utils/icons'
import fs from 'filesize'
import { Control } from './MessageControls'

const TEXT_SIZE='xsmall'
const TEXT_COLOR='dark-4'

function Typing({ignore, typists}) {
  const theme = useContext(ThemeContext)
  let typing = typists.filter((handle) => handle !== ignore)
  const len = typing.length
  if (len === 0) {
    return null
  }
  let text = {users: `${len}`, suffix: 'people are typing'}

  if (len === 1) {
    text = {users: typing[0], suffix: 'is typing'}
  } else if (len <= 3) {
    text = {users: typing.join(", "), suffix: 'are typing'}
  }

  return (
    <Box direction='row' align='center' gap='xxsmall'>
      <Text color={TEXT_COLOR} size={TEXT_SIZE} weight={500}>{text.users}</Text>
      <Text color={TEXT_COLOR} size={TEXT_SIZE}>{text.suffix}</Text>
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
      const found = edges.find(({node: {creator}}) => creator.id === me.id)
      if (found) setEdited(found.node.id)
    })
}

function InputFooter({typists, me: {handle}}) {
  return (
    <Box style={{height: '30px'}} pad={{top: '2px', bottom: '2px'}} align='center' direction='row' fill='horizontal'>
      <Box flex={false} width='calc(100% - 600px)' margin={{left: '5px'}}>
        <Typing typists={typists} ignore={handle}  />
      </Box>
      <HelpDoc/>
    </Box>
  )
}

export const INPUT_HEIGHT = '35px'

function FileInput({attachment, setAttachment}) {
  return (
    <HoveredBackground>
      <Box accentable style={{cursor: "pointer"}}>
        <FilePicker onChange={(file) => setAttachment(file)} maxSize={2000} onError={console.log}>
          <Control onClick={() => null} hoverIndicator='light-2' focusIndicator={false} tooltip='add attachment' align='center' justify='center'>
            <Attachment color={attachment ? 'action' : null} size='15px' />
          </Control>
        </FilePicker>
      </Box>
    </HoveredBackground>
  )
}

function SendMsg({loading, empty, onClick}) {
  return (
    <Box flex={false} focusIndicator={false} margin='4px' height='35px'
      width="35px" round='xxsmall' align='center' justify='center'
      onClick={empty ? null : onClick} background={loading ? null : (empty ? null : 'action')} >
      {loading ?
        <MoonLoader size={20} /> :
        <SendNew size='23px' color={empty ? 'light-3' : 'white'} />
      }
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

  const [mutation, {loading}] = useMutation(MESSAGE_MUTATION, {
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
    },
    onCompleted: () => {
      setUploadProgress(null)
      setReply(null)
      setAttachment(null)
      setWaterline(moment().add(5, 'minutes').toISOString())
    }
  })

  const boxRef = useRef()
  const parentId = reply && reply.id
  const empty = isEmpty(editorState)

  const sendMessage = useCallback(() => {
    const text = plainSerialize(editorState)
    mutation({variables: {
      conversationId: conversation.id,
      attributes: {attachment, parentId, text}
    }})
    Transforms.select(editor, Editor.start(editor, []))
    setEditorState(plainDeserialize(''))
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation, parentId, editorState, conversation, attachment, setAttachment, editor, setEditorState])

  return (
    <Box ref={dropRef} style={{maxHeight: '210px', minHeight: 'auto'}} fill='horizontal' pad={{horizontal: '10px'}}>
      {(attachment || uploadProgress) && (
        <Layer plain modal={false} position='top-right'>
          <Stack width='400px' margin={{right: 'small', top: '70px'}} anchor='top-right'>
            <Box width='400px' gap='xsmall' pad='small' round='xsmall' background='dark-1'>
              {attachment && (
                <Box>
                  <Text size='small' weight={500}>{attachment.name}</Text>
                  <Text size='small' color='dark-3'>{fs(attachment.size)}</Text>
                </Box>
              )}
              {!uploadProgress ?
                <Text size='small'>{plainSerialize(editorState) === '' ?
                  'add a message and upload' : 'press enter to upload'}</Text> :
                <Progress percent={uploadProgress} status={uploadProgress === 100 ? 'success' : 'active'} />
              }
            </Box>
            <Box flex={false} pad='xsmall' round='xsmall' focusIndicator={false} margin={{top: 'xsmall', right: 'xsmall'}}
                 hoverIndicator='dark-2' onClick={() => setAttachment(null)}>
              <Close size='12px' color='white' />
            </Box>
          </Stack>
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
        <Box border={{color: 'dark-3'}} fill='horizontal' height='calc(100%-25px)'
             direction="row" align="center" round='xsmall'>
          <MentionManager
            parentRef={boxRef}
            editor={editor}
            editorState={editorState}
            setEditorState={setEditorState}
            disableSubmit={setDisableSubmit}
            clearable={!disableSubmit}
            onChange={notifyTyping} />
          <FileInput attachment={attachment} setAttachment={setAttachment} />
          <SendMsg loading={loading} empty={empty} onClick={sendMessage} />
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
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const notifyTyping = useCallback(debounce(() => {
    channel && channel.push("typing", {who: "cares"})
  }, 1000, {leading: true}), [channel])

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