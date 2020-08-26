import React, { useContext } from 'react'
import { ChatOption } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import { CREATE_CHAT } from './queries'
import { addConversation } from './utils'
import { Conversations } from '../login/MyConversations'
import { CONTEXT_Q } from '../login/queries'
import { Box } from 'grommet'

function ChatTarget({onClick}) {
  return (
    <Box onClick={onClick} hoverIndicator='light-3' round='xsmall' pad='xsmall' align='center' justify='center'>
      <ChatOption size='12px' />
    </Box>
  )
}

export default function CreateChat({onChat, target, user}) {
  const {setCurrentConversation, workspaceId} = useContext(Conversations)
  const [mutation, {loading}] = useMutation(CREATE_CHAT, {
    variables: {userIds: [user.id]},
    update: (cache, {data: {createChat}}) => {
      const data = cache.readQuery({ query: CONTEXT_Q, variables: {workspaceId} });
      cache.writeQuery({
        query: CONTEXT_Q,
        variables: {workspaceId},
        data: addConversation(data, createChat)
      });
      setCurrentConversation(createChat)
      onChat && onChat()
    }
  })

  return React.createElement(target || ChatTarget, {onClick: mutation, loading})
}