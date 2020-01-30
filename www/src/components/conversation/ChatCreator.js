import React, { useState, useContext } from 'react'
import { Box, Text } from 'grommet'
import { Add } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import Modal, { ModalHeader } from '../utils/Modal'
import HoveredBackground from '../utils/HoveredBackground'
import { CREATE_CHAT } from './queries'
import { addConversation } from './utils'
import ParticipantInvite from './ParticipantInvite'
import Users from '../users/Users'
import Button from '../utils/Button'
import { CurrentUserContext } from '../login/EnsureLogin'
import { CONTEXT_Q } from '../login/queries'

function ChatButton({setCurrentConversation, setOpen, participants}) {
  const [mutation] = useMutation(CREATE_CHAT, {
    variables: {userIds: participants},
    update: (cache, { data: { createChat } }) => {
      setCurrentConversation(createChat)
      const prev = cache.readQuery({ query: CONTEXT_Q });
      cache.writeQuery({
        query: CONTEXT_Q,
        data: addConversation(prev, createChat)
      });
      setOpen(false)
    }
  })

  return (
    <Button
      size='small'
      onClick={mutation}
      margin={{left: 'xsmall'}}
      label='Go'
      height='100%'
      width='50px' />
  )
}

function Header({padding}) {
  return (
    <Box pad={padding} fill='horizontal' direction="row" align="center" margin={{bottom: '5px'}}>
      <HoveredBackground>
        <Box highlight width='100%'>
          <Text
            style={{cursor: 'pointer', fontWeight: 500}}
            size='15px'
            width='100%'
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
    </Box>
  )
}

function ChatCreator({padding, setCurrentConversation}) {
  const me = useContext(CurrentUserContext)
  const [participants, setParticipants] = useState([])

  const addParticipant = (user) => {
    setParticipants([user, ...participants])
  }

  const removeParticipant = (handle) => {
    setParticipants(participants.filter((u) => u.handle !== handle))
  }

  return (
    <Box fill='horizontal' pad={{right: '12px'}}>
      <Modal round='small' target={<Header padding={padding} />}>
        {setOpen => (
          <Box
            width="400px"
            style={{maxHeight: '70vh'}}
            pad={{bottom: 'small'}}
            round='small'>
            <ModalHeader text='Start a chat' setOpen={setOpen} />
            <Box style={{minHeight: '60px'}} border='bottom' margin={{bottom: 'small'}}>
              <ParticipantInvite
                direction='row'
                onAddParticipant={addParticipant}
                onRemoveParticipant={removeParticipant}
                additional={participants}
                pad='small'
                mapper={(u) => u.id}>
              {(participants) => (
                <ChatButton
                  setOpen={setOpen}
                  participants={participants}
                  setCurrentConversation={setCurrentConversation} />
              )}
              </ParticipantInvite>
            </Box>
            <Users
              onClick={addParticipant}
              showLoading
              noFlyout
              ignore={new Set([me.id, ...participants.map((u) => u.id)])}
              pad={{horizontal: 'small', vertical: 'xxsmall'}}
              margin={{bottom: 'xxsmall'}}
              onChat={() => setOpen(false)} />
          </Box>
        )}
      </Modal>
    </Box>

  )
}

export default ChatCreator