import React, {useState} from 'react'
import {useMutation} from 'react-apollo'
import {Box, Text, Markdown, Anchor, Calendar} from 'grommet'
import {Down} from 'grommet-icons'
import CloseableDropdown from '../utils/CloseableDropdown'
import Modal, {ModalHeader} from '../utils/Modal'
import {UPDATE_CONVERSATION, CONVERSATIONS_Q, UPDATE_PARTICIPANT, DELETE_PARTICIPANT} from './queries'
import ConversationEditForm from './ConversationEditForm'
import NotificationIcon from '../notifications/NotificationIcon'
import {CurrentUserContext} from '../login/EnsureLogin'
import Participants from './Participants'
import PinnedMessages from './PinnedMessages'
import Files from './Files'
import Commands from '../commands/Commands'
import {UserIcon} from '../users/Users'
import MessageSearch from './MessageSearch'
import NotificationsPreferences, {DEFAULT_PREFS} from '../users/NotificationPreferences'
import {updateConversation} from './utils'
import {conversationNameString, Icon} from './Conversation'
import pick from 'lodash/pick'
import InterchangeableBox from '../utils/InterchangeableBox'
import MenuItem, {SubMenu} from '../utils/MenuItem'
import HoveredBackground from '../utils/HoveredBackground'

export const BOX_ATTRS = {
  direction: "row",
  align: "center",
  style: {cursor: 'pointer', lineHeight: '15px'},
  pad: {horizontal: '8px'},
  border: 'right'
}

export function removeConversation(cache, conversationId) {
  const prev = cache.readQuery({ query: CONVERSATIONS_Q });
  const convs = prev.conversations.edges.filter(({node}) => node.id !== conversationId)
  const chats = prev.chats.edges.filter(({node}) => node.id !== conversationId)

  cache.writeQuery({
    query: CONVERSATIONS_Q,
    data: {
      ...prev,
      conversations: {
        ...prev.conversations,
        edges: convs
      },
      chats: {
        ...prev.chats,
        edges: chats
      }
    }
  });
}

function ConversationUpdateForm(props) {
  const [attributes, setAttributes] = useState({
    name: props.conversation.name,
    topic: props.conversation.topic,
    public: props.conversation.public,
    archived: !!props.conversation.archivedAt
  })

  const [mutation] = useMutation(UPDATE_CONVERSATION, {
    variables: {id: props.conversation.id, attributes: attributes},
    update: (cache, {data}) => {
      const prev = cache.readQuery({ query: CONVERSATIONS_Q });
      cache.writeQuery({
        query: CONVERSATIONS_Q,
        data: updateConversation(prev, data.updateConversation)
      });
      props.setOpen(false)
    }
  })

  return (
    <Box>
      <ModalHeader setOpen={props.setOpen} text={`Update #${props.conversation.name}`}/>
      <Box align='center' justify='center' pad='medium'>
        <ConversationEditForm
          cancel={() => props.setOpen(false)}
          state={attributes}
          mutation={mutation}
          onStateChange={(update) => setAttributes({...attributes, ...update})}
          action='Update' />
      </Box>
    </Box>
  )
}

function ConversationUpdate(props) {
  return (
    <Modal target={
      <Anchor color= 'black' size='xsmall' margin={{right: '3px'}}>
        <Markdown>{props.conversation.topic || "Add a description"}</Markdown>
      </Anchor>
    }>
    {setOpen => (<ConversationUpdateForm conversation={props.conversation} setOpen={setOpen} />)}
    </Modal>
  )
}

function ConversationName(props) {
  const [hover, setHover] = useState(false)
  const color = hover ? 'focus' : null
  const emptyColor = '#DADADA'
  return (
    <HoveredBackground>
      <Text
        accentable
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{cursor: "pointer"}}
        weight='bold'
        margin={{bottom: '5px'}}
        color={color}>
        <Icon
          textProps={{color: color}}
          emptyColor={emptyColor}
          me={props.me}
          conversation={props.conversation} />
        {conversationNameString(props.conversation, props.me)} <Down margin={{left: 'xsmall'}} color={color} size='12px'/>
      </Text>
    </HoveredBackground>
  )
}

const DROP_WIDTH = '240px'

function LeaveConversation(props) {
  const [mutation] = useMutation(DELETE_PARTICIPANT, {
    variables: {conversationId: props.conversation.id, userId: props.me.id},
    update: (cache, {data: {deleteParticipant}}) => {
      props.setOpen(false)
      props.setCurrentConversation(null)
      removeConversation(cache, deleteParticipant.conversationId)
    }
  })

  return (<Text onClick={mutation} size='small'>Leave conversation</Text>)
}

function ConversationDropdown(props) {
  const [notifMutation] = useMutation(UPDATE_PARTICIPANT)
  const currentParticipant = props.conversation.currentParticipant || {}
  const variables = {
    conversationId: props.conversation.id,
    userId: props.me.id
  }
  const preferences = currentParticipant.notificationPreferences || DEFAULT_PREFS

  return (
    <CloseableDropdown
      dropProps={{stretch: false}}
      style={{marginBottom: '5px'}}
      align={{left: 'left', top: "bottom"}}
      target={<ConversationName me={props.me} conversation={props.conversation} />}>
      {setOpen => (
        <InterchangeableBox width={DROP_WIDTH} round='small' pad={{vertical: 'xxsmall'}}>
        {setAlternate => (
          <>
          <SubMenu
            text='Notification Preferences'
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
            setAlternate={setAlternate}>
            <Box width={DROP_WIDTH} pad={{top: 'small'}} align='center' justify='center'>
              <Calendar
                date={(new Date()).toISOString()}
                size='small'
                showAdjacentDays={false}
                onSelect={(date) => {
                  setOpen(false)
                  props.setAnchor({timestamp: date})
                }} />
            </Box>
          </SubMenu>
          <MenuItem>
            <LeaveConversation setOpen={setOpen} {...props} />
          </MenuItem>
          </>
        )}
        </InterchangeableBox>
      )}
    </CloseableDropdown>
  )
}

function ConversationHeader(props) {
  return (
    <Box fill='horizontal' direction='row' align='center' pad={{left: '20px', top: '7px', bottom: '7px'}}>
      <Box fill='horizontal' direction='column'>
        <CurrentUserContext.Consumer>
        {me => (<ConversationDropdown me={me} {...props} />)}
        </CurrentUserContext.Consumer>
        <Box height='25px' direction='row' align='end' justify='start' pad={{top: '5px', bottom: '5px'}}>
          <Participants {...props} />
          <PinnedMessages {...props}  />
          <Files {...props} />
          <Box {...BOX_ATTRS} align='center' justify='center' border={null}>
            <ConversationUpdate {...props} />
          </Box>
        </Box>
      </Box>
      <MessageSearch conversation={props.conversation} setAnchor={props.setAnchor} />
      <UserIcon />
      <Commands />
      <CurrentUserContext.Consumer>
      {me => (<NotificationIcon me={me} {...props} />)}
      </CurrentUserContext.Consumer>
    </Box>
  )
}

export default ConversationHeader