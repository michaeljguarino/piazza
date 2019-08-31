import React, {useState} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Text, Markdown, Anchor} from 'grommet'
import {Down} from 'grommet-icons'
import CloseableDropdown from '../utils/CloseableDropdown'
import Modal, {ModalHeader} from '../utils/Modal'
import {UPDATE_CONVERSATION, CONVERSATIONS_Q, UPDATE_PARTICIPANT, DELETE_PARTICIPANT} from './queries'
import ConversationEditForm from './ConversationEditForm'
import NotificationIcon from '../notifications/NotificationIcon'
import {CurrentUserContext} from '../login/EnsureLogin'
import Participants from './Participants'
import PinnedMessages from './PinnedMessages'
import Commands from '../commands/Commands'
import {UserIcon} from '../users/Users'
import MessageSearch from './MessageSearch'
import NotificationsPreferences, {DEFAULT_PREFS} from '../users/NotificationPreferences'
import {updateConversation} from './utils'
import {conversationNameString, Icon} from './Conversation'
import pick from 'lodash/pick'
import moment from 'moment'
import InterchangeableBox from '../utils/InterchangeableBox'
import MenuItem, {SubMenu} from '../utils/MenuItem'
import HoveredBackground from '../utils/HoveredBackground'
import {DayPickerSingleDateController} from 'react-dates'
import 'react-dates/lib/css/_datepicker.css'

export const BOX_ATTRS = {
  direction: "row",
  align: "center",
  style: {cursor: 'pointer', lineHeight: '15px'},
  pad: {right: '5px', left: '5px'},
  border: 'right'
}

function removeConversation(cache, conversationId, setCurrentConversation) {
  setCurrentConversation(null)
  const {conversations} = cache.readQuery({ query: CONVERSATIONS_Q });

  cache.writeQuery({
    query: CONVERSATIONS_Q,
    data: {
      conversations: {
        ...conversations,
        edges: conversations.edges.filter((edge) => edge.node.id !== conversationId),
    }}
  });
}

function ConversationUpdate(props) {
  const [attributes, setAttributes] = useState({
    name: props.conversation.name,
    topic: props.conversation.topic,
    public: props.conversation.public
  })
  return (
    <Modal target={
      <Anchor size='xsmall' margin={{right: '3px'}}>
        <Markdown>{props.conversation.topic || "Add a description"}</Markdown>
      </Anchor>
    }>
    {setOpen => (
      <Mutation
        mutation={UPDATE_CONVERSATION}
        variables={{id: props.conversation.id, attributes: attributes}}
        update={(cache, {data}) => {
          const {conversations} = cache.readQuery({ query: CONVERSATIONS_Q });
          cache.writeQuery({
            query: CONVERSATIONS_Q,
            data: updateConversation(conversations, data.updateConversation)
          });
          setOpen(false)
        }} >
      {(mutation) => (
        <Box>
          <ModalHeader setOpen={setOpen} text={`Update #${props.conversation.name}`}/>
          <Box align='center' justify='center' pad='medium'>
            <ConversationEditForm
              state={attributes}
              mutation={mutation}
              onStateChange={(update) => setAttributes({...attributes, ...update})}
              action='Update' />
          </Box>
        </Box>
      )}
      </Mutation>
    )}
    </Modal>
  )
}

function ConversationName(props) {
  const [hover, setHover] = useState(false)
  const color = hover ? 'accent-1' : null
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
        <Icon textProps={{color: color}} emptyColor={emptyColor} me={props.me} conversation={props.conversation} /> {conversationNameString(props.conversation, props.me)} <Down color={color} size='12px'/>
      </Text>
    </HoveredBackground>
  )
}

function ConversationDropdown(props) {
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
        <InterchangeableBox width='230px' round='small'>
        {setAlternate => (
          <>
          <SubMenu
            text='Notification Preferences'
            setAlternate={setAlternate}>
            <Mutation mutation={UPDATE_PARTICIPANT}>
            {mutation => (
              <Box pad='small'>
                <NotificationsPreferences
                  vars={variables}
                  preferences={pick(preferences, ['mention', 'message', 'participant'])}
                  mutation={mutation} />
              </Box>
            )}
            </Mutation>
          </SubMenu>
          <SubMenu
            text='Jump to date'
            setAlternate={setAlternate}>
            <DayPickerSingleDateController
              date={moment()}
              focused
              onFocusChange={() => null}
              onDateChange={(date) => {
                setOpen(false)
                props.setAnchor({timestamp: date.toISOString()})
              }} />
          </SubMenu>
          <MenuItem>
            <Mutation
              mutation={DELETE_PARTICIPANT}
              variables={{conversationId: props.conversation.id, userId: props.me.id}}
              update={(cache, {data: {deleteParticipant}}) => {
                setOpen(false)
                removeConversation(cache, deleteParticipant.conversationId, props.setCurrentConversation)
              }}>
            {mutation => (<Text onClick={mutation} size='small'>Leave conversation</Text>)}
            </Mutation>
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
    <Box direction='row' border='bottom' align='center' pad={{left: '20px', top: '7px', bottom: '7px'}}>
      <Box fill='horizontal' direction='column'>
        <CurrentUserContext.Consumer>
        {me => (<ConversationDropdown me={me} {...props} />)}
        </CurrentUserContext.Consumer>
        <Box height='25px' direction='row' align='end' justify='start' pad={{top: '5px', bottom: '5px'}}>
          <Participants {...props} />
          <PinnedMessages {...props}  />
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