import React, { useState, useContext, useCallback, useEffect, useRef } from 'react'
import { Box, Text, Layer } from 'grommet'
import { Loading, Pill } from 'forge-core'
import { Wifi, Close, User, Down } from 'grommet-icons'
import Message, { MessagePlaceholder } from './Message'
import { useQuery, useSubscription } from 'react-apollo'
import SmoothScroller from '../utils/SmoothScroller'
import { MESSAGES_Q, DIALOG_SUB } from './queries'
import { Conversations } from '../login/MyConversations'
import { ReplyContext } from './ReplyProvider'
import AvailabilityDetector, { OFFLINE } from '../utils/AvailabilityDetector'
import { MessageScrollContext } from './MessageSubscription'
import { VisibleMessagesContext } from './VisibleMessages'
import { conversationNameString } from '../conversation/Conversation'
import { CurrentUserContext } from '../login/EnsureLogin'
import Avatar from '../users/Avatar'

export const PRELUDE = 'prl'

export const DialogContext = React.createContext({
  dialog: null,
  setDialog: () => null
})

export function DialogProvider({children}) {
  const [dialog, setDialog] = useState(null)

  return (
    <DialogContext.Provider value={{dialog, setDialog}}>
    {typeof children === 'function' ? children(dialog, setDialog) : children}
    </DialogContext.Provider>
  )
}

function OnlineInner({online, text}) {
  const [open, setOpen] = useState(true)

  if (!open) return null

  return (
    <Pill margin={{top: 'small'}} background='sidebar' onClose={() => setOpen(false)}>
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
// eslint-disable-next-line react-hooks/exhaustive-deps
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

function Participants({participants}) {
  const me = useContext(CurrentUserContext)
  return (
    <Box direction='row' gap='xsmall' margin={{bottom: 'small'}}>
      {participants
        .filter(({user: {id}}) => id !== me.id)
        .map(({user}) => <Avatar key={user.id} user={user} size='40px' />)}
    </Box>
  )
}

export function Prelude({conversation}) {
  const me = useContext(CurrentUserContext)
  const name = conversationNameString(conversation, me)
  const fullname = conversation.chat ? `your chat with ${name}` : `#${name}`

  return (
    <Box pad='medium' flex={false}>
      {conversation.chat && <Participants participants={conversation.chatParticipants} />}
      <Box fill='horizontal' gap='xsmall' justify='center'>
        <Text weight='bold'>This is the beginning of {fullname}</Text>
        <Box>
          <Text size='small'>You can invite other people by clicking the <User size='15px' /> icon
            above. Or you can try typing a slash-command, like `/giphy hey`</Text>
        </Box>
      </Box>
    </Box>
  )
}

function ReturnToBeginning({listRef}) {

  return (
    <Layer position='top-right' modal={false} plain>
      <Box direction='row' align='center' round='xsmall' gap='small' hoverIndicator='dark-1' background='dark-2'
        margin={{top: '70px', right: '10px'}}
        pad={{horizontal: 'small', vertical: 'xsmall'}}
        focusIndicator={false}
        onClick={() => listRef.scrollToItem(0)}>
        <Box direction='row' fill='horizontal' justify='center'>
          <Text size='small'>go to most recent</Text>
        </Box>
        <Down size='15px' />
      </Box>
    </Layer>
  )
}

export default function MessageList() {
  const [listRef, setListRef] = useState(null)
  const [loader, setLoader] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const {currentConversation, waterline} = useContext(Conversations)
  const {setReply} = useContext(ReplyContext)
  const {scrollTo} = useContext(MessageScrollContext)
  const {dialog, setDialog} = useContext(DialogContext)
  const {data: dialogData} = useSubscription(DIALOG_SUB)
  const {loading, error, data, fetchMore, refetch} = useQuery(MESSAGES_Q, {
    variables: {conversationId: currentConversation.id},
    fetchPolicy: 'cache-and-network'
  })
  const parentRef = useRef()
  const {setLastMessage} = useContext(VisibleMessagesContext)
  useEffect(() => {
    setScrolled(false)
  }, [currentConversation.id])
  const refreshList = useCallback(() => {
    listRef && listRef.resetAfterIndex(0, true)
  }, [listRef])

  useEffect(() => {
    listRef && !scrolled && listRef.scrollToItem(0)
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled, scrollTo])

  useEffect(() => {
    if (dialogData && dialogData.dialog) setDialog(dialogData.dialog)
  }, [dialogData])

  if (loading && !data) return <Loading height='calc(100vh - 135px)' width='100%' />
  if (error) return <div>wtf</div>

  let {edges, pageInfo} = data.conversation.messages

  return (
    <>
    {scrolled && <ReturnToBeginning listRef={listRef} />}
    <AvailabilityDetector>
    {status => status !== OFFLINE ? <BackOnline refetch={() => {
      listRef && listRef.scrollToItem(0)
      refetch()
      loader && loader.resetloadMoreItemsCache()
    }} status={status} /> : <Offline />}
    </AvailabilityDetector>
    <Box width='100%' height='100%' ref={parentRef}>
      <div style={{ flex: '1 1 auto' }}>
      <SmoothScroller
        listRef={listRef}
        setLoader={setLoader}
        setListRef={setListRef}
        hasNextPage={pageInfo.hasNextPage}
        loading={loading}
        handleScroll={setScrolled}
        items={pageInfo.hasNextPage ? edges : [...edges, PRELUDE]}
        sizeEstimate={({node}) => sizeEstimate(node)}
        refreshKey={currentConversation.id}
        keyFn={(edge) => edge === PRELUDE ? edge : edge.node.id}
        scrollTo='start'
        placeholder={(i) => <MessagePlaceholder index={i} />}
        onRendered={({visibleStopIndex}) => {
          const edge = edges[visibleStopIndex]
          setLastMessage(edge && edge.node)
        }}
        mapper={(edge, next, props) => {
          if (edge === PRELUDE) return <Prelude conversation={currentConversation} />
          return (
            <Message
              waterline={waterline}
              key={edge.node.id}
              parentRef={parentRef}
              conversation={currentConversation}
              message={edge.node}
              setReply={setReply}
              dialog={dialog}
              next={next.node}
              refreshList={refreshList}
              {...props} />)
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
  )
}