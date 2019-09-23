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
  return replaceEdges(prev, prev.conversation.messages.edges.filter(({node}) => {
    return node.id !== message.id && (!node.parent || node.parent.id !== message.id)
  }))
}

function replacePinnedMessagesAndIncrement(prev, edges, inc) {
  return {
    ...prev,
    conversation: {
      ...prev.conversation,
      pinnedMessageCount: prev.conversation.pinnedMessageCount + inc,
      pinnedMessages: {
        ...prev.conversation.pinnedMessages,
        edges: edges
      }
    }
  }
}

export function addPinnedMessage(prev, pin) {
  const edges = prev.conversation.pinnedMessages.edges
  if (edges.find((e) => e.node.message.id === pin.message.id)) return prev

  return replacePinnedMessagesAndIncrement(prev, [{node: pin, __typename: "PinnedMessageEdge"}, ...edges], 1)
}

export function removePinnedMessage(prev, pin) {
  if (!prev.conversation.pinnedMessages.edges.find((e) => e.node.message.id === pin.message.id)) return prev
  const edges = prev.conversation.pinnedMessages.edges.filter((e) => e.node.message.id !== pin.message.id)
  return replacePinnedMessagesAndIncrement(prev, edges, -1)
}