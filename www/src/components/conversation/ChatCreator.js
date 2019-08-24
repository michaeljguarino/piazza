import React, {useState} from 'react'
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
  const [iconHover, setIconHover] = useState(false)
  const [textHover, setTextHover] = useState(false)
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
          <Box width='100%'>
            <Text
              onMouseEnter={() => setTextHover(true)}
              onMouseLeave={() => setTextHover(false)}
              style={{cursor: 'pointer'}}
              size='small'
              width='100%'
              weight='bold'
              color={textHover ? null : props.textColor}>
                Chats
            </Text>
          </Box>
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
          </Box>
        </Box>}>
        {setOpen => (
          <Box width="400px" pad={{bottom: 'small'}} round='small'>
            <ModalHeader text='Start a chat' setOpen={setOpen} />
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
            <Box
              background='light-3'
              border='horizontal'
              elevation='xxsmall'
              margin={{bottom: 'xsmall'}}
              pad={{horizontal: 'small'}}>
              <Text size='small'>Users</Text>
            </Box>
            <Users
              onClick={addParticipant}
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