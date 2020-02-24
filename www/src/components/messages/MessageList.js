import React, { useState, useContext, useEffect, useRef } from 'react'
import { Box, Text } from 'grommet'
import { Wifi, Close, User } from 'grommet-icons'
import Message, { MessagePlaceholder } from './Message'
import { Subscription, useQuery } from 'react-apollo'
import SmoothScroller from '../utils/SmoothScroller'
import Loading from '../utils/Loading'
import { MESSAGES_Q, DIALOG_SUB } from './queries'
import { Conversations } from '../login/MyConversations'
import { ReplyContext } from './ReplyProvider'
import Pill from '../utils/Pill'
import AvailabilityDetector from '../utils/AvailabilityDetector'
import { MessageScrollContext } from './MessageSubscription'
import { VisibleMessagesContext } from './VisibleMessages'
import { conversationNameString } from '../conversation/Conversation'
import { CurrentUserContext } from '../login/EnsureLogin'

export const DialogContext = React.createContext({
  dialog: null,
  setDialog: () => null
})

export function DialogProvider(props) {
  const [dialog, setDialog] = useState(null)

  return (
    <DialogContext.Provider value={{dialog, setDialog}}>
    {props.children(dialog, setDialog)}
    </DialogContext.Provider>
  )
}

function OnlineInner({online, text}) {
  const [open, setOpen] = useState(true)

  if (!open) return null

  return (
    <Pill background='sidebar' onClose={() => setOpen(false)}>
      <Box direction='row' align='center' gap='small'>
        <Wifi size='14px' color={online ? 'status-ok' : 'status-critical'} />
        <Text size='small' color='focusText'>{text}</Text>
        <Close style={{cursor: 'pointer'}} color='focusText' size='14px' onClick={() => setOpen(false)} />
      </Box>
    </Pill>
  )
}

function BackOnline({refetch}) {
  useEffect(() => {
    refetch()
  }, [])
  return <OnlineInner online text='connection reestablished' />
}

function Offline() {
  return <OnlineInner text='connection lost' />
}

function sizeEstimate({embed, file, structuredMessage}) {
  if (embed || structuredMessage || file) return 310

  return 75
}

function Prelude({conversation}) {
  const me = useContext(CurrentUserContext)
  const name = conversationNameString(conversation, me)
  const fullname = conversation.chat ? `your chat with ${name}` : name
  return (
    <Box fill='horizontal' gap='xsmall' justify='center' pad='large'>
      <Text weight='bold'>This is the beginning of {fullname}</Text>
      <Box>
        <Text size='small'>You can invite other people by clicking the <User size='15px' /> icon above</Text>
        <Text size='small'>Try typing a slash-command, like `/giphy hey`</Text>
      </Box>
    </Box>
  )
}

export default function MessageList() {
  const [listRef, setListRef] = useState(null)
  const [ignore, setIgnore] = useState(true)
  const {currentConversation, waterline} = useContext(Conversations)
  const {setReply} = useContext(ReplyContext)
  const {scrollTo} = useContext(MessageScrollContext)
  const {loading, error, data, fetchMore, refetch} = useQuery(MESSAGES_Q, {
    variables: {conversationId: currentConversation.id},
  })
  const parentRef = useRef()
  const {setLastMessage} = useContext(VisibleMessagesContext)

  useEffect(() => {
    if (ignore) setTimeout(() => setIgnore(false), 15000)
  }, [ignore])

  useEffect(() => {
    listRef && !ignore && listRef.scrollToItem(0)
  }, [ignore, scrollTo, currentConversation])

  if (loading && !data) return <Loading height='calc(100vh - 135px)' width='100%' />
  if (error) return <div>wtf</div>

  let {edges, pageInfo} = data.conversation.messages

  return (
    <DialogProvider>
    {(dialog, setDialog) => (
      <Subscription subscription={DIALOG_SUB} onSubscriptionData={({subscriptionData}) => {
        if (!subscriptionData.data) return
        setDialog(subscriptionData.data.dialog)
      }}>
      {() => (
        <>
        <AvailabilityDetector>
        {online => online ? <BackOnline refetch={refetch} /> : <Offline />}
        </AvailabilityDetector>
        <Box width='100%' height='100%' ref={parentRef}>
          <div style={{ flex: '1 1 auto' }}>
          <SmoothScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            loading={loading}
            items={[...edges, 'PRELUDE']}
            sizeEstimate={({node}) => sizeEstimate(node)}
            scrollTo='start'
            placeholder={(i) => <MessagePlaceholder index={i} />}
            onRendered={({visibleStopIndex, ...rest}) => {
              const edge = edges[visibleStopIndex]
              setLastMessage(edge && edge.node)
            }}
            mapper={(edge, next, _ref, pos) => {
              if (edge === 'PRELUDE') return <Prelude conversation={currentConversation} />
              const {node} = edge
              return (
                <Message
                  waterline={waterline}
                  key={node.id}
                  parentRef={parentRef}
                  pos={pos}
                  conversation={currentConversation}
                  message={node}
                  setReply={setReply}
                  dialog={dialog}
                  next={next.node} />)
            }}
            loadNextPage={() => {
              return fetchMore({
                variables: {conversationId: currentConversation.id, cursor: pageInfo.endCursor},
                updateQuery: (prev, {fetchMoreResult: {conversation: {messages: {edges, pageInfo}}}}) => {
                  return {
                    ...prev,
                    conversation: {
                      ...prev.conversation,
                      messages: {
                        ...prev.conversation.messages,
                        pageInfo,
                        edges: [...prev.conversation.messages.edges, ...edges]
                      }
                    }
                  }
                }
              });
            }}
          />
          </div>
      </Box>
      </>
    )}
    </Subscription>
  )}
  </DialogProvider>
  )
}