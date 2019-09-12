import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Add} from 'grommet-icons'
import { Mutation } from 'react-apollo'
import Modal, {ModalHeader} from '../utils/Modal'
import HoveredBackground from '../utils/HoveredBackground'
import {CONVERSATIONS_Q, CREATE_CHAT} from './queries'
import {addConversation} from './utils'
import ParticipantInvite from './ParticipantInvite'
import Users from '../users/Users'
import Button from '../utils/Button'

function ChatCreator(props) {
  const [participants, setParticipants] = useState([])

  const addParticipant = (user) => {
    setParticipants([user, ...participants])
  }

  const removeParticipant = (handle) => {
    setParticipants(participants.filter((u) => u.handle !== handle))
  }

  return (
    <Box fill='horizontal' pad={{right: '10px'}}>
      <Modal round='small' target={
        <Box pad={props.padding} fill='horizontal' direction="row" align="center" margin={{bottom: '5px'}}>
          <HoveredBackground>
            <Box highlight width='100%'>
              <Text
                style={{cursor: 'pointer'}}
                size='small'
                width='100%'
                weight='bold'
                color='sidebarText'>
                  Chats
              </Text>
            </Box>
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
          </HoveredBackground>
        </Box>}>
        {setOpen => (
          <Box width="400px" style={{maxHeight: '70vh'}} pad={{bottom: 'small'}} round='small'>
            <ModalHeader text='Start a chat' setOpen={setOpen} />
            <Box height='80px'>
              <ParticipantInvite
                direction='row'
                onAddParticipant={addParticipant}
                onRemoveParticipant={removeParticipant}
                additional={participants}
                pad={{left: 'small', right: 'small', bottom: 'small', top: 'small'}}
                mapper={(u) => u.id}>
              {(participants) => (
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
                      height='100%'
                      width='50px' />
                  )}
                </Mutation>
              )}
              </ParticipantInvite>
            </Box>
            <Box
              background='light-3'
              border='horizontal'
              elevation='xxsmall'
              margin={{bottom: 'xsmall'}}
              justify='center'
              pad={{horizontal: 'small', vertical: 'xxsmall'}}>
              <Text size='small'>Users</Text>
            </Box>
            <Users
              onClick={addParticipant}
              noFlyout
              ignore={new Set(participants.map((u) => u.id))}
              pad={{horizontal: 'small', vertical: 'xxsmall'}}
              onChat={() => setOpen(false)} />
          </Box>
        )}
      </Modal>
    </Box>

  )
}

export default ChatCreator