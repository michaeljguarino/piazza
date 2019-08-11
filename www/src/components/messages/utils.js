function replaceEdges(prev, edges) {
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

export function applyNewMessage(prev, message) {
  const messages = prev.conversation.messages.edges
  const exists = messages.find((edge) => edge.node.id === message.id);
  if (exists) return prev;

  let messageNode = {node: message, __typename: "MessageEdge"}
  return replaceEdges(prev, [messageNode, ...messages])
}

export function updateMessage(prev, message) {
  return replaceEdges(
    prev, prev.conversation.messages.edges.map((e) => {
      if (e.node.id !== message.id) return e

      return {...e, node: message}
    }))
}

export function removeMessage(prev, message) {
  return replaceEdges(prev, prev.conversation.messages.edges.filter((e) => e.node.id !== message.id))
}