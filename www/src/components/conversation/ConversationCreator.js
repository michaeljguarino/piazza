import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Add} from 'grommet-icons'
import { useMutation } from 'react-apollo'
import Modal, {ModalHeader} from '../utils/Modal'
import HoveredBackground from '../utils/HoveredBackground'
import {CREATE_CONVERSATION, CONVERSATIONS_Q} from './queries'
import ConversationEditForm from './ConversationEditForm'
import {addConversation} from './utils'
import ConversationSearch from './ConversationSearch'

function ConversationForm(props) {
  const [state, setState] = useState({public: true})
  console.log(state)
  const [mutation] = useMutation(CREATE_CONVERSATION, {
    variables: {attributes: state},
    update: (cache, { data: { createConversation } }) => {
      props.setCurrentConversation(createConversation)
      const prev = cache.readQuery({ query: CONVERSATIONS_Q });
      cache.writeQuery({
        query: CONVERSATIONS_Q,
        data: addConversation(prev, createConversation)
      });
      props.setOpen(false)
    }
  })

  return (
    <Box>
      <ModalHeader setOpen={props.setOpen} text='Start a new conversation' />
      <Box align='center' justify='center' pad='medium'>
        <ConversationEditForm
          cancel={() => props.setOpen(false)}
          state={state}
          mutation={mutation}
          onStateChange={(update) => setState({...state, ...update})}
          />
      </Box>
    </Box>
  )
}

function ConversationCreator(props) {
  return (
    <Box fill='horizontal' pad={{right: '10px'}} margin={{top: 'medium'}}>
      <Box pad={props.padding} fill='horizontal' direction="row" align="center" margin={{bottom: '5px'}}>
        <Box width='100%'>
          <Modal target={
            <HoveredBackground>
              <Text
                style={{cursor: 'pointer'}}
                highlight
                size='small'
                width='100%'
                weight='bold'
                color='sidebarText'>
                  Conversations
              </Text>
            </HoveredBackground>
          }>
          {setOpen => (
            <Box width='30vw'>
              <ModalHeader text='Find a conversation to join' setOpen={setOpen} />
              <ConversationSearch
                setCurrentConversation={props.setCurrentConversation}
                onSearchClose={() => setOpen(false)} />
            </Box>
          )}
          </Modal>
        </Box>
        <Modal target={
          <HoveredBackground>
            <Box
              highlight
              style={{cursor: 'pointer'}}
              border
              round='full'
              width="20px"
              height='20px'
              justify='center'
              align='center'>
              <Add color='sidebarText' size="small" />
            </Box>
          </HoveredBackground>}>
          {setOpen => (
            <ConversationForm setOpen={setOpen} {...props} />
          )}
        </Modal>
      </Box>
    </Box>
  )
}

export default ConversationCreator