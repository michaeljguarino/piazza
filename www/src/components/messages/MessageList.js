import React from 'react'
import Message from './Message'
import { Query } from 'react-apollo'
import Scroller from '../utils/Scroller'
import Loading from '../utils/Loading'
import {mergeAppend} from '../../utils/array'
import {MESSAGES_Q} from './queries'

function MessageList(props) {
  return (
    <Query query={MESSAGES_Q} variables={{conversationId: props.conversation.id}} fetchPolicy='cache-and-network'>
      {({loading, error, data, fetchMore}) => {
        if (loading && !data.conversation) return <Loading height='calc(100vh - 135px)' width='100%' />
        if (error) return <div>wtf</div>
        let messageEdges = data.conversation.messages.edges
        let pageInfo = data.conversation.messages.pageInfo
        return (
          <Scroller
            id='message-viewport'
            edges={messageEdges}
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
        )
      }}
    </Query>
  )

}

export default MessageList