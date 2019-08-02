import {CONVERSATIONS_Q} from './queries'

function updateUnreadMessages(client, conversationId, update) {
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

export {updateUnreadMessages}