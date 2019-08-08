import React, {useState} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Text, Markdown, Anchor} from 'grommet'
import {SettingsOption} from 'grommet-icons'
import CloseableDropdown from '../utils/CloseableDropdown'
import Modal from '../utils/Modal'
import {UPDATE_CONVERSATION, CONVERSATIONS_Q, UPDATE_PARTICIPANT, DELETE_PARTICIPANT} from './queries'
import ConversationEditForm from './ConversationEditForm'
import NotificationIcon from '../notifications/NotificationIcon'
import {CurrentUserContext} from '../login/EnsureLogin'
import Participants from './Participants'
import Commands from '../commands/Commands'
import NotificationsPreferences, {DEFAULT_PREFS} from '../users/NotificationPreferences'
import pick from 'lodash/pick'
import {updateConversation} from './utils'

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
        <Box align='center' justify='center' pad='small'>
          <Text>Update # {props.conversation.name}</Text>
          <ConversationEditForm
            state={attributes}
            mutation={mutation}
            onStateChange={(update) => setAttributes({...attributes, ...update})}
            action='update' />
        </Box>
      )}
      </Mutation>
    )}
    </Modal>
  )
}

function NotificationsSettingsUpdate(props) {
  const currentParticipant = props.conversation.currentParticipant || {}
  const [preferences, setPreferences] = useState(currentParticipant.notificationPreferences || DEFAULT_PREFS)
  const variables = {
    conversationId: props.conversation.id,
    userId: props.me.id,
    prefs: pick(preferences, ['mention', 'message', 'participant'])
  }
  return (
    <Box style={{cursor: 'pointer'}} width='50px' align='center' justify='center'>
      <CloseableDropdown target={<SettingsOption size='25px' />}>
        {setOpen => (
          <Box gap='small' pad='small'>
          <Mutation mutation={UPDATE_PARTICIPANT} variables={variables}>
          {mutation => (
            <NotificationsPreferences
              vars={variables}
              preferences={preferences}
              setPreferences={setPreferences}
              mutation={mutation} />
          )}
          </Mutation>
          <Box pad='small' border='top'>
            <Mutation
              mutation={DELETE_PARTICIPANT}
              variables={{conversationId: props.conversation.id, userId: props.me.id}}
              update={(cache, {data: {deleteParticipant}}) => {
                setOpen(false)
                removeConversation(cache, deleteParticipant.conversationId, props.setCurrentConversation)
              }}>
            {mutation => (<Anchor onClick={mutation}>Leave conversation</Anchor>)}
            </Mutation>
          </Box>
        </Box>
        )}
      </CloseableDropdown>
    </Box>
  )
}

function ConversationHeader(props) {
  return (
    <Box direction='row' border='bottom' pad={{left: '20px', top: '7px', bottom: '7px'}}>
      <Box fill='horizontal' direction='column'>
        <Text weight='bold' margin={{bottom: '5px'}}># {props.conversation.name}</Text>
        <Box height='25px' direction='row' align='end' justify='start' pad={{top: '5px', bottom: '5px'}}>
          <Participants {...props} />
          <Box {...BOX_ATTRS} align='center' justify='center' border={null}>
            <ConversationUpdate {...props} />
          </Box>
        </Box>
      </Box>
      <CurrentUserContext.Consumer>
      {me => (<NotificationsSettingsUpdate me={me} {...props} />)}
      </CurrentUserContext.Consumer>
      <Commands />
      <CurrentUserContext.Consumer>
      {me => (<NotificationIcon me={me} {...props} />)}
      </CurrentUserContext.Consumer>
    </Box>
  )
}

export default ConversationHeader