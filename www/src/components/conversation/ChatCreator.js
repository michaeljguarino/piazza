import React from 'react'
import {Box, Text} from 'grommet'
import {Add} from 'grommet-icons'
import { Mutation } from 'react-apollo'
import Modal, {ModalHeader} from '../utils/Modal'
import {CONVERSATIONS_Q, CREATE_CHAT} from './queries'
import {addConversation} from './utils'
import ParticipantInvite from './ParticipantInvite'
import Users from '../users/Users'
import Button from '../utils/Button'

function ChatCreator(props) {
  return (
    <Box fill='horizontal' pad={{right: '10px'}}>
      <Box pad={props.padding} fill='horizontal' direction="row" align="center" margin={{bottom: '5px'}}>
        <Box width='100%'>
          <Text size='small' width='100%' weight='bold' color={props.textColor}>Chats</Text>
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
            <Box width="400px">
              <ModalHeader text='Start a chat' />
              <ParticipantInvite
                direction='row'
                pad={{left: 'small', right: 'small', bottom: 'small', top: 'small'}}
                mapper={(u) => u.id}>
              {participants => (
                <Mutation
                  mutation={CREATE_CHAT}
                  variables={{userIds: participants}}
                  update={(cache, { data: { createChat } }) => {
                    props.setCurrentConversation(createChat)
                    const prev = cache.readQuery({ query: CONVERSATIONS_Q });
                    cache.writeQuery({
                      query: CONVERSATIONS_Q,
                      data: addConversation(prev, createChat)
                    });
                    setOpen(false)
                  }}
                  >
                  {mutation => (
                    <Button
                      size='small'
                      onClick={mutation}
                      margin={{left: 'xsmall'}}
                      label='Go'
                      width='50px' />
                  )}
                </Mutation>
              )}
              </ParticipantInvite>
              <Users pad={{horizontal: 'small', vertical: 'xxsmall'}} onChat={() => setOpen(false)} />
            </Box>
          )}
        </Modal>
      </Box>
    </Box>
  )
}

export default ChatCreator