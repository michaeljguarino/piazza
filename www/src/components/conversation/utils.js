import {CONVERSATIONS_Q, CONVERSATIONS_SUB} from './queries'
import sortBy from 'lodash/sortBy'

export function updateUnreadMessages(client, conversationId, update) {
  const {conversations} = client.readQuery({ query: CONVERSATIONS_Q });
  let edge = conversations.edges.find((e) => e.node.id === conversationId)
  edge && (edge.node.unreadMessages = update(edge))

  client.writeQuery({
    query: CONVERSATIONS_Q,
    data: {
      conversations: {
        ...conversations,
        edges: conversations.edges,
    }}
  });
}

export function updateConversations(client, conversationSelector, update) {
  const {conversations} = client.readQuery({ query: CONVERSATIONS_Q })
  const edges = conversations.edges.map((e) => {
    if (conversationSelector(e)) return update(e)
    return e
  })

  client.writeQuery({
    query: CONVERSATIONS_Q,
    data: {
      conversations: {
        ...conversations,
        edges: edges,
    }}
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
        default:
          return prev
      }
    }
  })
}

export function addConversation(prev, conv) {
  let edges = prev.conversations.edges
  if (edges.find((e) => e.node.id === conv.id))
    return prev

  let newEdges = [{__typename: "ConversationEdge", node: conv}, ...prev.conversations.edges]
  return {
    ...prev,
    conversations: {
      ...prev.conversations,
      edges: sortBy(newEdges, (e) => e.node.name),
    }
  }
}

export function updateConversation(prev, conv) {
  return {
    conversations: {
      ...prev,
      edges: prev.edges.map((edge) => {
        if (edge.node.id !== conv.id) return edge

        return {
          ...edge,
          node: conv
        }
      })
    }
  }
}

export function removeConversation(prev, conv) {
  let edges = prev.conversations.edges.filter((e) => e.node.id !== conv.id)
  return {
    ...prev,
    conversations: {
      ...prev.conversations,
      edges: edges,
    }
  }
}
