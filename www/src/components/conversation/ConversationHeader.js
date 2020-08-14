import React, { useState, useContext } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { Box, Text, Markdown, Anchor, Calendar, Drop } from 'grommet'
import { Down } from 'grommet-icons'
import { Modal, ModalHeader, InterchangeableBox, MenuItem, SubMenu, HoveredBackground } from 'forge-core'
import { UPDATE_CONVERSATION, UPDATE_PARTICIPANT, DELETE_PARTICIPANT, CONVERSATION_CONTEXT } from './queries'
import ConversationEditForm from './ConversationEditForm'
import NotificationIcon from '../notifications/NotificationIcon'
import { CurrentUserContext } from '../login/EnsureLogin'
import Participants from './Participants'
import PinnedMessages from './PinnedMessages'
import Files from './Files'
import MessageSearch from './MessageSearch'
import NotificationsPreferences, { DEFAULT_PREFS } from '../users/NotificationPreferences'
import { updateConversation } from './utils'
import { conversationNameString, Icon, otherUser } from './Conversation'
import pick from 'lodash/pick'
import { Conversations } from '../login/MyConversations'
import { CONTEXT_Q } from '../login/queries'
import { ICON_HEIGHT } from '../Piazza'
import { useRef } from 'react'
import { StatusEmoji } from '../users/UserStatus'

export function removeConversation(cache, conversationId, workspaceId) {
  const {conversations, chats, ...prev} = cache.readQuery({ query: CONTEXT_Q, variables: {workspaceId} });
  const convEdges = conversations.edges.filter(({node}) => node.id !== conversationId)
  const chatEdges = chats.edges.filter(({node}) => node.id !== conversationId)

  cache.writeQuery({
    query: CONTEXT_Q,
    variables: { workspaceId },
    data: {
      ...prev,
      conversations: {...conversations, edges: convEdges},
      chats: {...chats, edges: chatEdges}
    }
  });
}

function ConversationUpdateForm({conversation, setOpen}) {
  const {workspaceId} = useContext(Conversations)
  const [attributes, setAttributes] = useState({
    name: conversation.name,
    topic: conversation.topic,
    public: conversation.public,
    archived: !!conversation.archivedAt
  })

  const [mutation] = useMutation(UPDATE_CONVERSATION, {
    variables: {id: conversation.id, attributes: attributes},
    update: (cache, {data}) => {
      const prev = cache.readQuery({ query: CONTEXT_Q, variables: {workspaceId} });
      cache.writeQuery({
        query: CONTEXT_Q,
        variables: {workspaceId},
        data: updateConversation(prev, data.updateConversation)
      });
      setOpen(false)
    }
  })

  return (
    <Box>
      <ModalHeader setOpen={setOpen} text={`Update #${conversation.name}`}/>
      <Box align='center' justify='center' pad='medium'>
        <ConversationEditForm
          cancel={() => setOpen(false)}
          state={attributes}
          mutation={mutation}
          chat={conversation.chat}
          onStateChange={(update) => setAttributes({...attributes, ...update})}
          action='Update' />
      </Box>
    </Box>
  )
}

function UpdateTarget({conversation, me}) {
  const other = otherUser(conversation, me)

  if (!other || !other.status) return (
    <Anchor color= 'black' size='xsmall' margin={{right: '3px'}}>
      <Markdown>{conversation.topic || "Add a description"}</Markdown>
    </Anchor>
  )

  return (
    <Box direction='row' align='center' gap='xsmall'>
      <StatusEmoji emoji={other.status.emoji} />
      <Anchor color='black' size='xsmall'>{other.status.text}</Anchor>
    </Box>
  )
}

function ConversationUpdate({conversation, me}) {
  return (
    <Modal target={<UpdateTarget conversation={conversation} me={me} />}>
    {setOpen => (<ConversationUpdateForm conversation={conversation} setOpen={setOpen} />)}
    </Modal>
  )
}

const ConversationName = React.forwardRef(({onClick, ...props}, ref) => {
  const emptyColor = '#DADADA'
  return (
    <Box
      ref={ref}
      direction='row'
      focusIndicator={false}
      gap='xsmall'
      align='center'
      margin={{vertical: 'xsmall'}}>
      <Icon emptyColor={emptyColor} me={props.me} conversation={props.conversation} />
      <Anchor color='black' style={{fontWeight: 600}} size='medium' onClick={onClick}>
        {conversationNameString(props.conversation, props.me)}
      </Anchor>
      <Down size='12px' />
    </Box>
  )
})

const DROP_WIDTH = '260px'

function LeaveConversation(props) {
  const {workspaceId} = useContext(Conversations)
  const [mutation] = useMutation(DELETE_PARTICIPANT, {
    variables: {conversationId: props.conversation.id, userId: props.me.id},
    update: (cache, {data: {deleteParticipant}}) => {
      props.setOpen(false)
      props.setCurrentConversation(null)
      removeConversation(cache, deleteParticipant.conversationId, workspaceId)
    }
  })

  return (<Text onClick={mutation} size='small'>Leave conversation</Text>)
}

function ConversationDropdown({setAnchor, ...props}) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  const [notifMutation] = useMutation(UPDATE_PARTICIPANT)
  const currentParticipant = props.conversation.currentParticipant || {}
  const variables = {
    conversationId: props.conversation.id,
    userId: props.me.id
  }
  const preferences = currentParticipant.notificationPreferences || DEFAULT_PREFS

  return (
    <>
    <ConversationName
      ref={ref}
      me={props.me}
      conversation={props.conversation}
      onClick={() => setOpen(true)} />
    {open && (
      <Drop stretch={false} target={ref.current} align={{left: 'left', top: 'bottom'}} onClickOutside={() => setOpen(false)}>
        <InterchangeableBox width={DROP_WIDTH} round='small' pad={{vertical: 'xxsmall'}} hover='focus'>
        {setAlternate => (
          <>
          <SubMenu
            text='Notification Preferences'
            hover='focus'
            setAlternate={setAlternate}>
            <Box width={DROP_WIDTH} pad='small'>
              <NotificationsPreferences
                vars={variables}
                preferences={pick(preferences, ['mention', 'message', 'participant'])}
                mutation={notifMutation} />
            </Box>
          </SubMenu>
          <SubMenu
            text='Jump to date'
            hover='focus'
            setAlternate={setAlternate}>
            <Box width={DROP_WIDTH} pad={{vertical: 'small'}} align='center' justify='center'>
              <Calendar
                date={(new Date()).toISOString()}
                size='small'
                onSelect={(date) => {
                  setOpen(false)
                  setAnchor({timestamp: date})
                }} />
            </Box>
          </SubMenu>
          <MenuItem hover='focus'>
            <LeaveConversation setOpen={setOpen} {...props} />
          </MenuItem>
          </>
        )}
        </InterchangeableBox>
      </Drop>
    )}
    </>
  )
}

export function HeaderIcon({icon, count}) {
  const positive = count > 0
  return (
    <HoveredBackground>
      <Box
        accentable
        direction='row'
        align='center'
        gap='xsmall'
        style={{cursor: 'pointer'}}
        pad={positive ? 'xsmall' : null}
        border={positive ? {color: 'light-6'} : null}
        round='xsmall'>
        {positive && <Text size='xsmall'>{count}</Text>}
        {React.createElement(icon, {size: (positive ? '16px' : ICON_HEIGHT)})}
      </Box>
    </HoveredBackground>
  )
}

export default function ConversationHeader({setAnchor}) {
  const {currentConversation} = useContext(Conversations)
  const me = useContext(CurrentUserContext)
  const {data, loading, fetchMore, subscribeToMore} = useQuery(CONVERSATION_CONTEXT, {
    variables: {id: currentConversation.id}
  })

  return (
    <Box fill='horizontal' background='white' direction='row' align='center' pad={{left: '20px', vertical: '7px'}}>
      <Box fill='horizontal' direction='column'>
        <ConversationDropdown me={me} conversation={currentConversation} setAnchor={setAnchor} />
        <Box height='25px' direction='row' align='end' justify='start' pad={{vertical: '5px',}}>
          <ConversationUpdate conversation={currentConversation} me={me} />
        </Box>
      </Box>
      <Box direction='row' align='center' flex={false} gap='small'>
        <PinnedMessages
          data={data}
          loading={loading}
          fetchMore={fetchMore}
          subscribeToMore={subscribeToMore}
          conversation={currentConversation} />
        <Files
          subscribeToMore={subscribeToMore}
          conversationId={currentConversation.id}
          data={data} />
      </Box>
      <MessageSearch conversation={currentConversation} setAnchor={setAnchor} />
      <Box direction='row' align='center' flex={false} gap='small'>
        <Participants
          data={data}
          loading={loading}
          fetchMore={fetchMore}
          subscribeToMore={subscribeToMore}
          conversation={currentConversation} />
        <NotificationIcon me={me} conversation={currentConversation} />
      </Box>
    </Box>
  )
}