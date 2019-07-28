import React from 'react'
import { Query, Mutation } from 'react-apollo'
import {Box, Text} from 'grommet'
import {UserNew, Trash} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import UserListEntry from '../users/UserListEntry'
import {PARTICIPANTS_Q, DELETE_CONVERSATION, CONVERSATIONS_Q} from './queries'

function ConversationHeader(props) {
  return (
    <Box border='bottom' pad={{left: '20px', top: '10px'}} margin={{bottom: '10px'}}>
      <Text weight='bold' margin={{bottom: '5px'}}>#{props.conversation.name}</Text>
      <Query query={PARTICIPANTS_Q} variables={{conversationId: props.conversation.id}}>
        {({loading, error, data}) => {
          if (loading) return (<Box direction='row'><UserNew/>...</Box>)

          return (
            <Box direction='row' align='end' justify='start' margin={{top: '5px', bottom: '5px'}}>
              <Dropdown>
                <Box direction="row" align="center" pad={{right: '5px', left: '5px'}} style={{cursor: 'pointer'}} border='right'>
                  <Text margin={{right: '3px'}}><UserNew size='15px' /></Text>
                  <Text size='xsmall'>{data.conversation.participants.edges.length}</Text>
                </Box>
                <Box pad="small" gap='small'>
                  <Text size='small' weight='bold'>Participants</Text>
                  {data.conversation.participants.edges.map((p) => (
                    <UserListEntry key={p.node.id} user={p.node.user} color='normal' />
                  ))}
                </Box>
              </Dropdown>
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
                  <Box direction='row' align='center' style={{cursor: 'pointer'}} pad={{right: '5px', left: '5px'}}>
                    <Text><Trash size="15px" onClick={mutation} /></Text>
                  </Box>
                )}
              </Mutation>
            </Box>
          )
        }}
      </Query>
    </Box>
  )
}

export default ConversationHeader