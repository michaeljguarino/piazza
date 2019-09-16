import React, {useState} from 'react'
import {Chat} from 'grommet-icons'
import {Mutation} from 'react-apollo'
import {CREATE_CHAT, CONVERSATIONS_Q} from './queries'
import {addConversation} from './utils'
import {Conversations} from '../login/MyConversations'

function CreateChat(props) {
  const [hover, setHover] = useState(false)
  return (
    <Conversations.Consumer>
    {({setCurrentConversation}) => (
      <Mutation
      mutation={CREATE_CHAT}
      variables={{userIds: [props.user.id]}}
      update={(cache, {data: {createChat}}) => {
        const data = cache.readQuery({ query: CONVERSATIONS_Q });
        cache.writeQuery({
          query: CONVERSATIONS_Q,
          data: addConversation(data, createChat)
        });
        setCurrentConversation(createChat)
        props.onChat && props.onChat()
      }} >
      {mutation => (
        <Chat 
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          color={hover ? 'focus' : 'dark-5'}
          style={{cursor: 'pointer'}} 
          onClick={mutation} 
          size='15px' />
      )}
      </Mutation>
    )}
    </Conversations.Consumer>

  )
}

export default CreateChat