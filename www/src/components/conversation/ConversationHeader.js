import React, {useState} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Text, Markdown} from 'grommet'
import {Trash} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import {DELETE_CONVERSATION, UPDATE_CONVERSATION, CONVERSATIONS_Q} from './queries'
import ConversationEditForm from './ConversationEditForm'
import NotificationIcon from '../notifications/NotificationIcon'
import {CurrentUserContext} from '../login/EnsureLogin'
import Participants from './Participants'
import Commands from '../commands/Commands'

export const BOX_ATTRS = {
  direction: "row",
  align: "center",
  style: {cursor: 'pointer', lineHeight: '15px'},
  pad: {right: '5px', left: '5px'},
  border: 'right'
}

function ConversationDelete(props) {
  return (
    <Mutation
      mutation={DELETE_CONVERSATION}
      variables={{id: props.conversation.id}}
      update={(cache, {data: {deleteConversation}}) => {
        props.setCurrentConversation(null)
        const {conversations} = cache.readQuery({ query: CONVERSATIONS_Q });
        const newData = {
          conversations: {
            ...conversations,
            edges: conversations.edges.filter((edge) => edge.node.id !== deleteConversation.id),
        }}

        cache.writeQuery({
          query: CONVERSATIONS_Q,
          data: newData
        });
      }}>
      {(mutation) => (
        <Trash size="15px" onClick={mutation} />
      )}
    </Mutation>
  )
}

function ConversationUpdate(props) {
  const [attributes, setAttributes] = useState({
    name: props.conversation.name,
    topic: props.conversation.topic
  })
  const [open, setOpen] = useState(false)
  return (
    <Mutation
      mutation={UPDATE_CONVERSATION}
      variables={{id: props.conversation.id, attributes: attributes}}
      update={(cache, {data: {updateConversation}}) => {
        const {conversations} = cache.readQuery({ query: CONVERSATIONS_Q });
        const newData = {
          conversations: {
            ...conversations,
            edges: conversations.edges.map((edge) => {
              if (edge.node.id !== updateConversation.id) return edge

              return {
                ...edge,
                node: updateConversation
              }
            })
          }
        }

        cache.writeQuery({
          query: CONVERSATIONS_Q,
          data: newData
        });
        setOpen(false)
      }} >
      {(mutation) => (
        <Dropdown open={open}>
          <Text syle={{lineHeight: '15px'}} size='xsmall' margin={{right: '3px'}}>
            <Markdown>{props.conversation.topic || "Add a description"}</Markdown>
          </Text>
          <Box align='center' justify='center' pad='small'>
            <Text>Update # {props.conversation.name}</Text>
          </Box>
          <ConversationEditForm
            state={{name: props.conversation.name, topic: props.conversation.topic}}
            mutation={mutation}
            onStateChange={(update) => setAttributes({...attributes, ...update})}
            open={open}
            action='update' />
        </Dropdown>
      )}
    </Mutation>
  )
}

function ConversationHeader(props) {
  const [editing, setEditing] = useState(false)
  return (
    <Box direction='row' border='bottom' pad={{left: '20px', top: '7px', bottom: '7px'}}>
      <Box fill='horizontal' direction='column'>
        <Text weight='bold' margin={{bottom: '5px'}}># {props.conversation.name}</Text>
        <Box height='25px' direction='row' align='end' justify='start' pad={{top: '5px', bottom: '5px'}}>
          <Participants {...props} />
          <Box {...BOX_ATTRS} align='center' justify='center' border={null} onMouseOver={() => setEditing(true)} onMouseOut={() => setEditing(false)}>
            <ConversationUpdate editing={editing} {...props} />
            <Text style={editing ? {lineHeight: '15px'} : {lineHeight: '15px', visibility: 'hidden'}}>
              <ConversationDelete {...props} />
            </Text>
          </Box>
        </Box>
      </Box>
      <Commands />
      <CurrentUserContext.Consumer>
      {me => (<NotificationIcon me={me} {...props} />)}
      </CurrentUserContext.Consumer>
    </Box>
  )
}

export default ConversationHeader