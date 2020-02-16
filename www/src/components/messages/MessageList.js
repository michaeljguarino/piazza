import React, { useState, useContext, useEffect } from 'react'
import { Box, Text } from 'grommet'
import { Wifi, Close } from 'grommet-icons'
import Message, { MessagePlaceholder } from './Message'
import { Subscription, useQuery } from 'react-apollo'
import Scroller from '../utils/Scroller'
import Loading from '../utils/Loading'
import { mergeAppend } from '../../utils/array'
import { MESSAGES_Q, DIALOG_SUB } from './queries'
import { Conversations } from '../login/MyConversations'
import { ReplyContext } from './ReplyProvider'
import Pill from '../utils/Pill'
import AvailabilityDetector from '../utils/AvailabilityDetector'
import { MessageScrollContext } from './MessageSubscription'

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

function MessageList() {
  const [ignore, setIgnore] = useState(true)
  const {currentConversation, waterline} = useContext(Conversations)
  const {setReply} = useContext(ReplyContext)
  const {scrollTo} = useContext(MessageScrollContext)
  const {loading, error, data, fetchMore, refetch} = useQuery(MESSAGES_Q, {
    variables: {conversationId: currentConversation.id},
    fetchPolicy: 'cache-and-network'
  })
  useEffect(() => {
    setTimeout(() => setIgnore(false), 10000)
  }, [])

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
        <Scroller
          id='message-viewport'
          edges={edges}
          placeholder={(i) => <MessagePlaceholder index={i} />}
          loading={loading}
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
              scrollTo={scrollTo} />
          )}
          onLoadMore={() => {
            if (!pageInfo.hasNextPage) return

            fetchMore({
              variables: {conversationId: currentConversation.id, cursor: pageInfo.endCursor},
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
        </>
    )}
    </Subscription>
    )}
  </DialogProvider>
  )

}

export default MessageList