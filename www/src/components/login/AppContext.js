import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { useQuery, useApolloClient } from 'react-apollo'
import { CONTEXT_Q } from './queries'
import { Box } from 'grommet'
import { wipeToken } from '../../helpers/authentication'
import { CurrentUserContext } from './EnsureLogin'
import { EmojiContext } from '../emoji/EmojiProvider'
import Loading from '../utils/Loading'
import { updateConversations, subscribeToNewConversations } from '../conversation/utils'
import { Conversations } from './MyConversations'

export default function AppContext({children, sideEffects}) {
  const client = useApolloClient()
  const [currentConversation, setCurrentConversation] = useState(null)
  const [waterline, setWaterline] = useState(null)
  const {loading, data, loadMore, subscribeToMore, error} = useQuery(CONTEXT_Q)

  if (loading) return (<Box height='100vh'><Loading/></Box>)

  if (error || !data || !data.me || !data.me.id) {
    wipeToken()
    return (<Redirect to='/login'/>)
  }

  let current = currentConversation || data.conversations.edges[0].node

  const wrappedSetCurrentConversation = (conv) => {
    if (conv) {
      updateConversations(client, (e) => e.node.id === conv.id, (e) => (
        {...e, node: {...e.node, unreadMessages: 0, unreadNotifications: 0}}
      ))
    }

    if (sideEffects) {
      for (const sideEffect of sideEffects) {
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
  const {conversations, chats} = data

  return (
    <CurrentUserContext.Provider value={data.me}>
      <EmojiContext.Provider value={data.emoji.edges}>
        <Conversations.Provider value={{
          setWaterline,
          loadMore,
          conversations,
          chats,
          waterline: waterline || lastSeenAt,
          currentConversation: current,
          setCurrentConversation: wrappedSetCurrentConversation
        }}>
          {children}
        </Conversations.Provider>
      </EmojiContext.Provider>
    </CurrentUserContext.Provider>
  )
}