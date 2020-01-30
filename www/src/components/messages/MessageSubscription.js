import React, { useContext } from 'react'
import { Subscription } from 'react-apollo'
import { MESSAGES_SUB, MESSAGES_Q } from './queries'
import { updateConversations } from '../conversation/utils'
import { applyNewMessage, updateMessage, removeMessage } from './utils'
import { CurrentUserContext } from '../login/EnsureLogin'
import { Conversations } from '../login/MyConversations'

function applyDelta({client, subscriptionData}, currentConversation, me) {
  if (!subscriptionData.data) return
  const messageDelta = subscriptionData.data.messageDelta
  const message = messageDelta.payload
  const convId = message.conversationId

  if (convId !== currentConversation.id) {
    updateConversations(client, (e) => e.node.id === convId, (e) => (
      {...e, node: {...e.node, unreadMessages: e.node.unreadMessages + 1}}
    ))
  }

  if (message.creator.id === me.id) return

  try {
    const query = {query: MESSAGES_Q, variables: {conversationId: convId}}
    const prev = client.readQuery(query)
    if (!prev) return

    switch(messageDelta.delta) {
      case "CREATE":
        client.writeQuery({...query, data: applyNewMessage(prev, message)})
        break
      case "DELETE":
        client.writeQuery({...query, data: removeMessage(prev, message)})
        break
      case "UPDATE":
        client.writeQuery({...query, data: updateMessage(prev, message)})
        break
      default:
        return
    }
  } catch (exception) {
    console.log('query not found')
  }
}

function MessageSubscription(props) {
  const me = useContext(CurrentUserContext)
  const {currentConversation} = useContext(Conversations)

  return (
    <Subscription subscription={MESSAGES_SUB} onSubscriptionData={(data) =>
      applyDelta(data, currentConversation, me)
    }>
    {() => props.children}
    </Subscription>
  )
}

export default MessageSubscription