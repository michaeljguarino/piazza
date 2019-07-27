import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import {Box, Text} from 'grommet'
import {UserNew} from 'grommet-icons'

const PARTICIPANTS_Q = gql`
  query ConversationQuery($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      participants(first: 25, after: $cursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id
            user {
              name
              handle
              backgroundColor
            }
          }
        }
      }
    }
  }
`
function ConversationHeader(props) {

  return (
    <Box border='bottom' pad={{left: '20px', top: '10px', bottom: '5px'}} margin={{bottom: '10px'}}>
      <Text weight='bold'>#{props.conversation.name}</Text>
      <Query query={PARTICIPANTS_Q} variables={{conversationId: props.conversation.id}}>
        {({loading, error, data}) => {
          if (loading) return (<Box direction='row'><UserNew/>...</Box>)

          return (
            <Box direction='row' align='center' justify='start' pad={{left: '5px'}}>
              <Text><UserNew size='15px' /></Text>
              <Text size='small'>{data.conversation.participants.edges.length}</Text>
            </Box>
          )
        }}
      </Query>
    </Box>
  )
}

export default ConversationHeader