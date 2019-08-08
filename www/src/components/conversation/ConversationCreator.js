import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Add} from 'grommet-icons'
import { Mutation } from 'react-apollo'
import Modal from '../utils/Modal'
import {CREATE_CONVERSATION, CONVERSATIONS_Q} from './queries'
import ConversationEditForm from './ConversationEditForm'
import {addConversation} from './utils'

function ConversationCreator(props) {
  const [state, setState] = useState({})
  return (
    <Box fill='horizontal' pad={{right: '10px'}}>
      <Box pad={props.padding} fill='horizontal' direction="row" align="center" margin={{bottom: '5px'}}>
        <Box width='100%'>
          <Text size='small' width='100%' weight='bold' color={props.textColor}>Conversations</Text>
        </Box>
        <Modal target={
          <Box
            style={{cursor: 'pointer'}}
            border
            round='full'
            width="20px"
            height='20px'
            justify='center'
            align='center'>
            <Add size="small" />
          </Box>}>
          {setOpen => (
            <Mutation
              mutation={CREATE_CONVERSATION}
              variables={{attributes: state}}
              update={(cache, { data: { createConversation } }) => {
                props.setCurrentConversation(createConversation)
                const prev = cache.readQuery({ query: CONVERSATIONS_Q });
                cache.writeQuery({
                  query: CONVERSATIONS_Q,
                  data: addConversation(prev, createConversation)
                });
                setOpen(false)
              }}
            >
            {mutation => (
              <Box pad='small'>
                <Box align='center' justify='center'>
                  <Text>Create a new conversation</Text>
                </Box>
                <ConversationEditForm
                  state={state}
                  mutation={mutation}
                  onStateChange={(update) => setState({...state, ...update})}
                  />
              </Box>
            )}
            </Mutation>
          )}
        </Modal>
      </Box>
    </Box>
  )
}

export default ConversationCreator