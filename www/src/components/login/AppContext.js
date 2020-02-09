import React, { useState, useContext } from 'react'
import { Redirect, useParams, useHistory } from 'react-router-dom'
import { useQuery, useApolloClient } from 'react-apollo'
import { CONTEXT_Q } from './queries'
import { Box } from 'grommet'
import { wipeToken } from '../../helpers/authentication'
import { CurrentUserContext } from './EnsureLogin'
import { EmojiContext } from '../emoji/EmojiProvider'
import Loading from '../utils/Loading'
import { updateConversations, subscribeToNewConversations } from '../conversation/utils'
import { Conversations } from './MyConversations'
import { WorkspaceContext } from '../Workspace'

function _findConversation({edges}, id) {
  const conv = edges.find(({node}) => node.id === id)
  return conv && conv.node
}

function findConversation({conversations, chats}, id) {
  return _findConversation(conversations, id) || _findConversation(chats, id)
}

function conversationUrl({id}, workspaceId) {
  return `/wk/${workspaceId}/${id}`
}

export default function AppContext({children, sideEffects}) {
  const client = useApolloClient()
  const {workspaces} = useContext(WorkspaceContext)
  const [waterline, setWaterline] = useState(null)
  const {conversationId, workspace} = useParams()
  const workspaceId = workspace || workspaces[0].id

  const {loading, data, fetchMore, subscribeToMore, error} = useQuery(CONTEXT_Q, {
    variables: {workspaceId}
  })

  let history = useHistory()

  if (loading) return <Box height='100vh'><Loading/></Box>

  if (error || !data || !data.me || !data.me.id) {
    wipeToken()
    return <Redirect to='/login'/>
  }

  const {conversations, chats} = data
  const current = findConversation(data, conversationId) || conversations.edges[0].node

  if (!conversationId) return <Redirect to={conversationUrl(current, workspaceId)} />

  const setCurrentConversation = (conv) => {
    if (conv) {
      updateConversations(client, workspaceId, (e) => e.node.id === conv.id, (e) => (
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
    history.push(conversationUrl(conv, workspaceId))
  }
  const setWorkspace = ({id}) => history.push(`/wk/${id}`)

  subscribeToNewConversations(subscribeToMore, workspaceId)

  const lastSeenAt = (
    current &&
    current.currentParticipant &&
    current.currentParticipant.lastSeenAt
  )

  return (
    <CurrentUserContext.Provider value={data.me}>
      <EmojiContext.Provider value={data.emoji.edges}>
        <Conversations.Provider value={{
          setWaterline,
          fetchMore,
          conversations,
          chats,
          setCurrentConversation,
          workspaceId,
          setWorkspace,
          waterline: waterline || lastSeenAt,
          currentConversation: current
        }}>
          {children}
        </Conversations.Provider>
      </EmojiContext.Provider>
    </CurrentUserContext.Provider>
  )
}