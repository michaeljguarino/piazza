import {CONVERSATIONS_Q, CONVERSATIONS_SUB} from './queries'

export function updateUnreadMessages(client, conversationId, update) {
  const {conversations} = client.readQuery({ query: CONVERSATIONS_Q });
  let edge = conversations.edges.find((e) => e.node.id === conversationId)
  edge && (edge.node.unreadMessages = update(edge))
  const newData = {
    conversations: {
      ...conversations,
      edges: conversations.edges,
  }}

  client.writeQuery({
    query: CONVERSATIONS_Q,
    data: newData
  });
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

  return {
    ...prev,
    conversations: {
      ...prev.conversations,
      edges: [{__typename: "ConversationEdge", node: conv}, ...prev.conversations.edges],
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
