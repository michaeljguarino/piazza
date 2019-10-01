import React, {useState} from 'react'
import {Box} from 'grommet'
import Loading from '../utils/Loading'
import {Query, ApolloConsumer} from 'react-apollo'
import {subscribeToNewConversations, updateConversations} from '../conversation/utils'
import {CONVERSATIONS_Q} from '../conversation/queries'
import {FlyoutContext} from '../utils/Flyout'

const POLL_INTERVAL=30000
export const Conversations = React.createContext({
                                currentConversation: null,
                                conversations: null,
                                setCurrentConversation: null,
                                waterline: null,
                                setWaterline: null
                             })

function MyConversations(props) {
  const [currentConversation, setCurrentConversation] = useState(null)
  const [waterline, setWaterline] = useState(null)

  return (
    <FlyoutContext.Consumer>
    {({setOpen}) => (
      <ApolloConsumer>
      {client => (
        <Query query={CONVERSATIONS_Q} pollInterval={POLL_INTERVAL}>
        {({loading, _error, data, loadMore, subscribeToMore}) => {
          if (loading) return (<Box height="100vh"><Loading /></Box>)
          let current = currentConversation || data.conversations.edges[0].node
          const wrappedSetCurrentConversation = (conv) => {
            if (conv) {
              updateConversations(client, (e) => e.node.id === conv.id, (e) => (
                {...e, node: {...e.node, unreadMessages: 0, unreadNotifications: 0}}
              ))
            }

            if (props.sideEffects) {
              for (const sideEffect of props.sideEffects) {
                sideEffect()
              }
            }
            setOpen(false)

            setWaterline(conv.currentParticipant && conv.currentParticipant.lastSeenAt)
            setCurrentConversation(conv)
          }
          subscribeToNewConversations(subscribeToMore)
          const lastSeenAt = (
            current &&
            current.currentParticipant &&
            current.currentParticipant.lastSeenAt
          )
          return (
            <Conversations.Provider value={{
              setWaterline,
              waterline: waterline || lastSeenAt,
              currentConversation: current,
              conversations: data.conversations,
              chats: data.chats,
              setCurrentConversation: wrappedSetCurrentConversation,
              loadMore: loadMore
            }}>
              {props.children(
                current,
                data.conversations,
                data.chats,
                wrappedSetCurrentConversation,
                loadMore,
                waterline,
                setWaterline
              )}
            </Conversations.Provider>
          )
        }}
        </Query>
      )}
      </ApolloConsumer>
    )}
    </FlyoutContext.Consumer>
  )
}

export default MyConversations