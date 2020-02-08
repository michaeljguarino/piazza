import React, { useState, useContext } from 'react'
import { Chat } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import { CREATE_CHAT } from './queries'
import {addConversation} from './utils'
import { Conversations } from '../login/MyConversations'
import { CONTEXT_Q } from '../login/queries'

export default function CreateChat({onChat, user}) {
  const {setCurrentConversation} = useContext(Conversations)
  const [hover, setHover] = useState(false)
  const [mutation] = useMutation(CREATE_CHAT, {
    variables: {userIds: [user.id]},
    update: (cache, {data: {createChat}}) => {
      const data = cache.readQuery({ query: CONTEXT_Q });
      cache.writeQuery({
        query: CONTEXT_Q,
        data: addConversation(data, createChat)
      });
      setCurrentConversation(createChat)
      onChat && onChat()
    }
  })

  return (
    <Chat
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      color={hover ? 'focus' : null}
      style={{cursor: 'pointer'}}
      onClick={mutation}
      size='12px' />
  )
}