import {CONVERSATIONS_Q, CONVERSATIONS_SUB} from './queries'
import sortBy from 'lodash/sortBy'

export function updateUnreadMessages(client, conversationId, update) {
  updateConversations(
    client,
    (e) => e.node.id === conversationId,
    (e) => ({...e, unreadMessages: update(e)})
  )
}

export function updateConversations(client, conversationSelector, update) {
  const {conversations, chats} = client.readQuery({ query: CONVERSATIONS_Q })
  const edges = conversations.edges.map((e) => {
    if (conversationSelector(e)) return update(e)
    return e
  })
  const chatEdges = chats.edges.map((e) => {
    if (conversationSelector(e)) return update(e)
    return e
  })

  client.writeQuery({
    query: CONVERSATIONS_Q,
    data: {
      conversations: {
        ...conversations,
        edges: edges,
      },
      chats: {
        ...chats,
        edges: chatEdges,
      }
    }
  })
}

export function subscribeToNewConversations(subscribeToMore) {
  return subscribeToMore({
    document: CONVERSATIONS_SUB,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const participantDelta = subscriptionData.data.participantDelta
      const participant = participantDelta.payload
      switch(participantDelta.delta) {
        case "CREATE":
          return addConversation(prev, participant.conversation)
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

export function addConversation(prev, conv) {
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
  let edges = prev.conversations.edges.filter((e) => e.node.id !== conv.id)
  let chatEdges = prev.chats.edges.filter((e) => e.node.id !== conv.id)
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
