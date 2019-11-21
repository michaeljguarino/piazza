import React, {useState} from 'react'
import Message, {MessagePlaceholder} from './Message'
import { Subscription, useQuery } from 'react-apollo'
import Scroller from '../utils/Scroller'
import Loading from '../utils/Loading'
import {mergeAppend} from '../../utils/array'
import {MESSAGES_Q, DIALOG_SUB} from './queries'

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

function MessageList(props) {
  const {loading, error, data, fetchMore} = useQuery(MESSAGES_Q, {
    variables: {conversationId: props.conversation.id},
    fetchPolicy: 'cache-and-network'
  })

  if (loading && !data) return <Loading height='calc(100vh - 135px)' width='100%' />
  if (error) return <div>wtf</div>

  let messageEdges = data.conversation.messages.edges
  let pageInfo = data.conversation.messages.pageInfo
  return (
    <DialogProvider>
    {(dialog, setDialog) => (
      <Subscription subscription={DIALOG_SUB} onSubscriptionData={({subscriptionData}) => {
        if (!subscriptionData.data) return
        setDialog(subscriptionData.data.dialog)
      }}>
      {() => (
        <>
        <Scroller
          id='message-viewport'
          edges={messageEdges}
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
              waterline={props.waterline}
              key={edge.node.id}
              parentRef={ref}
              pos={pos}
              conversation={props.conversation}
              message={edge.node}
              setReply={props.setReply}
              dialog={dialog}
              next={next.node} />
          )}
          onLoadMore={() => {
            if (!pageInfo.hasNextPage) return

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
        </>
    )}
    </Subscription>
    )}
  </DialogProvider>
  )

}

export default MessageList