import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Add} from 'grommet-icons'
import { Mutation } from 'react-apollo'
import Modal, {ModalHeader} from '../utils/Modal'
import {CREATE_CONVERSATION, CONVERSATIONS_Q} from './queries'
import ConversationEditForm from './ConversationEditForm'
import {addConversation} from './utils'
import ConversationSearch from '../search/ConversationSearch'

function ConversationCreator(props) {
  const [state, setState] = useState({})
  const [searching, setSearching] = useState(false)
  const [hover, setHover] = useState(false)
  const [iconHover, setIconHover] = useState(false)
  return (
    <Box fill='horizontal' pad={{right: '10px'}} margin={{top: 'medium'}}>
      <Box pad={props.padding} fill='horizontal' direction="row" align="center" margin={{bottom: '5px'}}>
        {searching ?
          <ConversationSearch
            setCurrentConversation={props.setCurrentConversation}
            onSearchClose={() => {
              setSearching(false)
              setHover(false)
            }} /> :
          <Box width='100%'>
            <Text
              style={{cursor: 'pointer'}}
              onClick={() => setSearching(true)}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              size='small'
              width='100%'
              weight='bold'
              color={hover ? null : props.textColor}>
                Conversations
            </Text>
          </Box>
        }
        <Modal target={
          <Box
            onMouseEnter={() => setIconHover(true)}
            onMouseLeave={() => setIconHover(false)}
            style={{cursor: 'pointer'}}
            border
            round='full'
            width="20px"
            height='20px'
            justify='center'
            align='center'>
            <Add color={iconHover ? null : props.textColor} size="small" />
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
              <Box>
                <ModalHeader setOpen={setOpen} text='Start a new conversation' />
                <Box align='center' justify='center' pad='medium'>
                  <ConversationEditForm
                    state={state}
                    mutation={mutation}
                    onStateChange={(update) => setState({...state, ...update})}
                    />
                </Box>
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