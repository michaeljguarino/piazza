import React from 'react'
import { Query, Mutation } from 'react-apollo'
import {Box, Text} from 'grommet'
import {UserNew, Trash} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import UserListEntry from '../users/UserListEntry'
import {PARTICIPANTS_Q} from './queries'

function ConversationHeader(props) {
  return (
    <Box border='bottom' pad={{left: '20px', top: '10px'}} margin={{bottom: '10px'}}>
      <Text weight='bold'>#{props.conversation.name}</Text>
      <Query query={PARTICIPANTS_Q} variables={{conversationId: props.conversation.id}}>
        {({loading, error, data}) => {
          if (loading) return (<Box direction='row'><UserNew/>...</Box>)

          return (
            <Box direction='row' align='end' justify='start' pad={{left: '5px'}} margin={{top: '5px', bottom: '5px'}}>
              <Dropdown>
                <Box direction="row" align="center" style={{cursor: 'pointer'}}>
                  <Text margin={{right: '3px'}}><UserNew size='15px' /></Text>
                  <Text size='xsmall'>{data.conversation.participants.edges.length}</Text>
                </Box>
                <Box pad="small">
                  {data.conversation.participants.edges.map((p) => (
                    <UserListEntry key={p.node.id} user={p.node.user} color='normal' />
                  ))}
                </Box>
              </Dropdown>
              <Text margin={{right: '5px', left: '5px'}}>|</Text>
              {/* <Mutation query={""}>
                {(mutation) => ( */}
                  <div style={{cursor: 'pointer'}}>
                    <Trash size="15px" />
                  </div>
                {/* )}
              </Mutation> */}
            </Box>
          )
        }}
      </Query>
    </Box>
  )
}

export default ConversationHeader