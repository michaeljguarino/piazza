import React, {useState} from 'react'
import { Query, Mutation } from 'react-apollo'
import {Box, Text, Collapsible} from 'grommet'
import {UserNew, Trash, Edit} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import UserListEntry from '../users/UserListEntry'
import {PARTICIPANTS_Q, DELETE_CONVERSATION, CONVERSATIONS_Q} from './queries'

const BOX_ATTRS = {
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
        <Text height='15px' style={{lineHeight: '15px'}}>
          <Trash size="15px" onClick={mutation} />
        </Text>
      )}
    </Mutation>
  )
}

function ConversationHeader(props) {
  const [editing, setEditing] = useState(false)
  return (
    <Box border='bottom' pad={{left: '20px', top: '10px'}} margin={{bottom: '10px'}}>
      <Text weight='bold' margin={{bottom: '5px'}}>#{props.conversation.name}</Text>
      <Query query={PARTICIPANTS_Q} variables={{conversationId: props.conversation.id}}>
        {({loading, error, data}) => {
          if (loading) return (<Box direction='row'>...</Box>)

          return (
            <Box height='25px' direction='row' align='end' justify='start' pad={{top: '5px', bottom: '5px'}}>
              <Dropdown>
                <Box {...BOX_ATTRS}>
                  <Text height='15px' style={{lineHeight: '15px'}} margin={{right: '3px'}}><UserNew size='15px' /></Text>
                  <Text size='xsmall'>{data.conversation.participants.edges.length}</Text>
                </Box>
                <Box pad="small" gap='small'>
                  <Text size='small' weight='bold'>Participants</Text>
                  {data.conversation.participants.edges.map((p) => (
                    <UserListEntry key={p.node.id} user={p.node.user} color='normal' />
                  ))}
                </Box>
              </Dropdown>
              <Box {...BOX_ATTRS} align='center' justify='center' border={null} onMouseOver={() => setEditing(true)} onMouseOut={() => setEditing(false)}>
                <Text syle={{lineHeight: '15px'}} size='xsmall' margin={{right: '3px'}}>{data.conversation.topic || "Add a description"}</Text>
                <div style={editing ? {} : {visibility: 'hidden'}}>
                  <Text height='15px' style={{lineHeight: '15px'}} margin={{right: '5px'}}><Edit size='15px' /></Text>
                  <ConversationDelete {...props} />
                </div>
              </Box>
            </Box>
          )
        }}
      </Query>
    </Box>
  )
}

export default ConversationHeader