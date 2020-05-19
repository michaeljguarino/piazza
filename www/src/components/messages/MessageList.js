import React, { useState, useContext, useEffect, useRef } from 'react'
import { Box, Text, Layer } from 'grommet'
import { Wifi, Close, User, Down } from 'grommet-icons'
import Message, { MessagePlaceholder } from './Message'
import { Subscription, useQuery } from 'react-apollo'
import SmoothScroller from '../utils/SmoothScroller'
import Loading from '../utils/Loading'
import { MESSAGES_Q, DIALOG_SUB } from './queries'
import { Conversations } from '../login/MyConversations'
import { ReplyContext } from './ReplyProvider'
import Pill from '../utils/Pill'
import AvailabilityDetector, { OFFLINE } from '../utils/AvailabilityDetector'
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

function BackOnline({refetch, status}) {
  useEffect(() => {
    refetch()
  }, [status])
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
  const fullname = conversation.chat ? `your chat with ${name}` : `#${name}`
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

function ReturnToBeginning({listRef}) {
  return (
    <Layer position='top' modal={false} plain>
      <Box pad={{top: '5px'}}>
        <Box
          style={{minWidth: '100px'}}
          direction='row'
          align='center'
          width='25vw'
          round='small'
          pad={{horizontal: 'small', vertical: 'xsmall'}}
          gap='small'
          background='brand'>
          <Box direction='row' fill='horizontal' justify='center'>
            <Text size='small'>go to most recent</Text>
          </Box>
          <Box pad={{right: 'small'}}>
            <Down style={{cursor: 'pointer'}} onClick={() => listRef.scrollToItem(0)} size='15px' />
          </Box>
        </Box>
      </Box>
    </Layer>
  )
}

export default function MessageList() {
  const [listRef, setListRef] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const {currentConversation, waterline} = useContext(Conversations)
  const {setReply} = useContext(ReplyContext)
  const {scrollTo} = useContext(MessageScrollContext)
  const {loading, error, data, fetchMore, refetch} = useQuery(MESSAGES_Q, {
    variables: {conversationId: currentConversation.id}
  })
  const parentRef = useRef()
  const {setLastMessage} = useContext(VisibleMessagesContext)
  useEffect(() => {
    setScrolled(false)
  }, [currentConversation.id])

  useEffect(() => {
    listRef && !scrolled && listRef.scrollToItem(0)
  }, [scrolled, scrollTo])

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
        {scrolled && <ReturnToBeginning listRef={listRef} />}
        <AvailabilityDetector>
        {status => status !== OFFLINE ? <BackOnline refetch={() => {
          listRef && listRef.scrollToItem(0)
          refetch()
        }} status={status} /> : <Offline />}
        </AvailabilityDetector>
        <Box width='100%' height='100%' ref={parentRef}>
          <div style={{ flex: '1 1 auto' }}>
          <SmoothScroller
            listRef={listRef}
            setListRef={setListRef}
            hasNextPage={pageInfo.hasNextPage}
            loading={loading}
            handleScroll={setScrolled}
            items={pageInfo.hasNextPage ? edges : [...edges, 'PRELUDE']}
            sizeEstimate={({node}) => sizeEstimate(node)}
            refreshKey={currentConversation.id}
            keyFn={(edge) => edge === 'PRELUDE' ? edge : edge.node.id}
            scrollTo='start'
            placeholder={(i) => <MessagePlaceholder index={i} />}
            onRendered={({visibleStopIndex}) => {
              const edge = edges[visibleStopIndex]
              setLastMessage(edge && edge.node)
            }}
            mapper={(edge, next) => {
              if (edge === 'PRELUDE') return <Prelude conversation={currentConversation} />
              return (
                <Message
                  waterline={waterline}
                  key={edge.node.id}
                  parentRef={parentRef}
                  conversation={currentConversation}
                  message={edge.node}
                  setReply={setReply}
                  dialog={dialog}
                  next={next.node} />)
            }}
            loadNextPage={() => fetchMore({
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
              })
            }
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