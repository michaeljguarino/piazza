import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Add} from 'grommet-icons'
import { useMutation } from 'react-apollo'
import Modal, {ModalHeader} from '../utils/Modal'
import HoveredBackground from '../utils/HoveredBackground'
import {CREATE_CONVERSATION, CONVERSATIONS_Q} from './queries'
import ConversationEditForm from './ConversationEditForm'
import {addConversation} from './utils'
import ConversationSearch from '../search/ConversationSearch'

function ConversationForm(props) {
  const [state, setState] = useState({public: true})
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
          onStateChange={(update) => setState({...props.state, ...update})}
          />
      </Box>
    </Box>
  )
}

function ConversationCreator(props) {
  const [searching, setSearching] = useState(false)
  return (
    <Box fill='horizontal' pad={{right: '10px'}} margin={{top: 'medium'}}>
      <Box pad={props.padding} fill='horizontal' direction="row" align="center" margin={{bottom: '5px'}}>
        {searching ?
          <ConversationSearch
            setCurrentConversation={props.setCurrentConversation}
            onSearchClose={() => setSearching(false)} /> :
          <Box width='100%'>
            <HoveredBackground>
              <Text
                style={{cursor: 'pointer'}}
                onClick={() => setSearching(true)}
                highlight
                size='small'
                width='100%'
                weight='bold'
                color='sidebarText'>
                  Conversations
              </Text>
            </HoveredBackground>
          </Box>
        }
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