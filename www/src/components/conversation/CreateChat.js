import React, {useState} from 'react'
import {Chat} from 'grommet-icons'
import {useMutation} from 'react-apollo'
import {CREATE_CHAT, CONVERSATIONS_Q} from './queries'
import {addConversation} from './utils'
import {Conversations} from '../login/MyConversations'

function CreateChat(props) {
  const [hover, setHover] = useState(false)
  const [mutation] = useMutation(CREATE_CHAT, {
    variables: {userIds: [props.user.id]},
    update: (cache, {data: {createChat}}) => {
      const data = cache.readQuery({ query: CONVERSATIONS_Q });
      cache.writeQuery({
        query: CONVERSATIONS_Q,
        data: addConversation(data, createChat)
      });
      props.setCurrentConversation(createChat)
      props.onChat && props.onChat()
    }
  })

  return (
    <Chat
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      color={hover ? 'focus' : 'dark-5'}
      style={{cursor: 'pointer'}}
      onClick={mutation}
      size='15px' />
  )
}

function WrappedCreateChat(props) {
  return (
    <Conversations.Consumer>
      {({setCurrentConversation}) => (
        <CreateChat setCurrentConversation={setCurrentConversation} {...props} />
      )}
    </Conversations.Consumer>
  )
}

export default WrappedCreateChat