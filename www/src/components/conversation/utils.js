import React from 'react'
import {Box} from 'grommet'
import { CONVERSATIONS_SUB } from './queries'
import sortBy from 'lodash/sortBy'
import {BeatLoader} from 'react-spinners'
import { CONTEXT_Q } from '../login/queries'
import { addWorkspace } from '../workspace/utils'

export function Loader() {
  return (
    <Box height='100%' align='center' justify='center' border='right' pad={{horizontal: 'xsmall'}}>
      <BeatLoader size={3} />
    </Box>
  )
}

export function updateUnreadMessages(client, conversationId, update) {
  updateConversations(
    client,
    (e) => e.node.id === conversationId,
    (e) => ({...e, unreadMessages: update(e)})
  )
}

export function updateConversations(client, workspaceId, selector, update) {
  const {conversations, chats, ...rest} = client.readQuery({ query: CONTEXT_Q, variables: {workspaceId} })
  const updater = (e) => selector(e) ? update(e) : e

  client.writeQuery({
    query: CONTEXT_Q,
    variables: {workspaceId},
    data: {
      ...rest,
      conversations: {
        ...conversations,
        edges: conversations.edges.map(updater),
      },
      chats: {
        ...chats,
        edges: chats.edges.map(updater),
      }
    }
  })
}

export function subscribeToNewConversations(subscribeToMore, workspaceId, client) {
  return subscribeToMore({
    document: CONVERSATIONS_SUB,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const participantDelta = subscriptionData.data.participantDelta
      const participant = participantDelta.payload
      switch(participantDelta.delta) {
        case "CREATE":
          return addConversation(prev, participant.conversation, workspaceId, client)
        case "DELETE":
          return removeConversation(prev, participant.conversation)
        case "UPDATE":
          return updateConversation(prev, participant.conversation)
        default:
          return prev
      }
    }
  })
}

export function addConversation(prev, conv, workspaceId, client) {
  if (workspaceId && conv.workspace.id !== workspaceId) {
    if (client) {
      addWorkspace(client, conv.workspace)
    }
    return prev
  }

  let scope = conv.chat ? prev.chats : prev.conversations
  if (scope.edges.find((e) => e.node.id === conv.id)) return prev

  scope = {
    ...scope,
    edges: sortBy([{__typename: "ConversationEdge", node: conv}, ...scope.edges], (e) => e.node.name)
  }
  if (conv.chat) return {...prev, chats: scope}
  return {...prev, conversations: scope}
}

export function updateConversation(prev, conv) {
  let scope = conv.chat ? prev.chats : prev.conversations
  scope = {...scope, edges: scope.edges.map((edge) => {
    if (edge.node.id !== conv.id) return edge

    return {
      ...edge,
      node: conv
    }
  })}
  if (conv.chat) return {...prev, chats: scope}
  return {...prev, conversations: scope}
}

export function removeConversation(prev, conv) {
  let edges = prev.conversations.edges.filter(({node: {id}}) => id !== conv.id)
  let chatEdges = prev.chats.edges.filter(({node: {id}}) => id !== conv.id)
  return {
    ...prev,
    conversations: {
      ...prev.conversations,
      edges: edges,
    },
    chats: {
      ...prev.chats,
      edges: chatEdges
    }
  }
}
