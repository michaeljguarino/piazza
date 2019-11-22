import React, { useState, useContext, useEffect, useCallback } from 'react'
import { Box, Text } from 'grommet'
import { Wifi, Close } from 'grommet-icons'
import Message, { MessagePlaceholder } from './Message'
import { Subscription, useQuery } from 'react-apollo'
import Scroller from '../utils/Scroller'
import SmoothScroller from '../utils/SmoothScroller'
import Loading from '../utils/Loading'
import { MESSAGES_Q, DIALOG_SUB } from './queries'
import { Conversations } from '../login/MyConversations'
import { ReplyContext } from './ReplyProvider'
import Pill from '../utils/Pill'
import AvailabilityDetector from '../utils/AvailabilityDetector'
import { MessageScrollContext } from './MessageSubscription'
import { debounce } from 'lodash'

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

export default function MessageList() {
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
    const timeout = ignore ? setTimeout(() => setIgnore(false), 15000) : null
    return () => timeout && clearTimeout(timeout)
  }, [ignore])

  const onScroll = useCallback(debounce(() => setIgnore(true), 150, {leading: true}), [])

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
          <SmoothScroller
            hasNextPage={pageInfo.hasNextPage}
            loading={loading}
            items={messageEdges}
            scrollTo='start'
            placeholder={(i) => <MessagePlaceholder index={i} />}
            onItemsRendered={({visibleEndIndex}) => {
              console.log(visibleEndIndex)
              setLastMessage(messageEdges[visibleEndIndex].node)
            }}
            mapper={({node}, next, _ref, pos) => (
              <Message
                waterline={props.waterline}
                key={node.id}
                parentRef={parentRef}
                pos={pos}
                conversation={props.conversation}
                message={node}
                setReply={props.setReply}
                dialog={dialog}
                next={next.node} />
            )}
            loadNextPage={() => {
              fetchMore({
                variables: {conversationId: props.conversation.id, cursor: pageInfo.endCursor},
                updateQuery: (prev, {fetchMoreResult}) => {
                  const {edges, pageInfo} = fetchMoreResult.conversation.messages
                  return edges.length ? {
                    ...prev,
                    conversation: {
                      ...prev.conversation,
                      messages: {
                        ...prev.conversation.messages,
                        edges: mergeAppend(edges, prev.conversation.messages.edges, (e) => e.node.id),
                        pageInfo
                      }
                    }
                  } : prev;
                }
              })
            }}
          />

      </Box>
        {/* <Scroller
          id='message-viewport'
          edges={edges}
          placeholder={(i) => <MessagePlaceholder key={i} index={i} />}
          onScroll={onScroll}
          offset={100}
          direction='up'
          style={{
            overflow: 'auto',
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            flexDirection: 'column-reverse',
          }}
          mapper={(edge, next, ref, pos) => (
            <Message
              waterline={waterline}
              key={edge.node.id}
              parentRef={ref}
              pos={pos}
              conversation={currentConversation}
              message={edge.node}
              setReply={setReply}
              dialog={dialog}
              next={next.node}
              scrollTo={scrollTo}
              ignoreScrollTo={ignore} />
          )}
          onLoadMore={(setLoading) => {
            if (!pageInfo.hasNextPage) return setLoading(false)
            setLoading(true)
            fetchMore({
              variables: {conversationId: currentConversation.id, cursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult}) => {
                console.log('returned')
                setLoading(false)
                const {edges, pageInfo} = fetchMoreResult.conversation.messages
                return edges.length ? {
                  ...prev,
                  conversation: {
                    ...prev.conversation,
                    messages: {
                      ...prev.conversation.messages,
                      edges: [...prev.conversation.messages.edges, ...edges],
                      pageInfo
                    }
                  }
                } : prev;
              }
            })
          }}
        /> */}
      </>
    )}
    </Subscription>
  )}
  </DialogProvider>
  )
}