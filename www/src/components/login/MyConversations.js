import React, {useState} from 'react'
import {Box} from 'grommet'
import Loading from '../utils/Loading'
import {useQuery, useApolloClient} from 'react-apollo'
import { subscribeToNewConversations, updateConversations } from '../conversation/utils'
import {CONVERSATIONS_Q} from '../conversation/queries'

export const Conversations = React.createContext({
                                currentConversation: null,
                                conversations: null,
                                setCurrentConversation: null,
                                waterline: null,
                                setWaterline: null,
                                fetchMore: () => null,
                                workspaceId: null
                             })

function MyConversations(props) {
  const client = useApolloClient()
  const [currentConversation, setCurrentConversation] = useState(null)
  const [waterline, setWaterline] = useState(null)
  const {loading, data, fetchMore, subscribeToMore} = useQuery(CONVERSATIONS_Q)

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
    if (conv) {
      setWaterline(conv.currentParticipant && conv.currentParticipant.lastSeenAt)
    }
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
      fetchMore,
      waterline: waterline || lastSeenAt,
      currentConversation: current,
      conversations: data.conversations,
      chats: data.chats,
      setCurrentConversation: wrappedSetCurrentConversation,
    }}>
    {props.children(
      current,
      data.conversations,
      data.chats,
      wrappedSetCurrentConversation,
      fetchMore,
      waterline,
      setWaterline
    )}
    </Conversations.Provider>
  )
}

export default MyConversations