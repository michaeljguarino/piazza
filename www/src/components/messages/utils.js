export function applyNewMessage(prev, message) {
  const messages = prev.conversation.messages.edges
  const exists = messages.find((edge) => edge.node.id === message.id);
  if (exists) return prev;

  let messageNode = {node: message, __typename: "MessageEdge"}
  return Object.assign({}, prev, {
    conversation: {
      ...prev.conversation,
      messages: {
        ...prev.conversation.messages,
        edges: [messageNode, ...messages],
      }
    }
  })
}

export function removeMessage(prev, message) {
  const edges = prev.conversation.messages.edges.filter((e) => e.node.id !== message.id)

  return {
    ...prev,
    conversation: {
      ...prev.conversation,
      messages: {
        ...prev.conversation.messages,
        edges: edges
      }
    }
  }
}