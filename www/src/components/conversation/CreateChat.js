import React from 'react'
import {Chat} from 'grommet-icons'
import {Mutation} from 'react-apollo'
import {Box} from 'grommet'
import {CREATE_CHAT, CONVERSATIONS_Q} from './queries'
import {addConversation} from './utils'
import {Conversations} from '../login/MyConversations'

function CreateChat(props) {
  return (
    <Conversations.Consumer>
    {({setCurrentConversation}) => (
      <Mutation
      mutation={CREATE_CHAT}
      variables={{userId: props.user.id}}
      update={(cache, {data: {createChat}}) => {
        const data = cache.readQuery({ query: CONVERSATIONS_Q });
        cache.writeQuery({
          query: CONVERSATIONS_Q,
          data: addConversation(data, createChat)
        });
        setCurrentConversation(createChat)
      }} >
      {mutation => (
        <Box style={{cursor: 'pointer'}} align='center' justify='center' onClick={mutation}>
          <Chat size='15px' />
        </Box>
      )}
      </Mutation>
    )}
    </Conversations.Consumer>

  )
}

export default CreateChat