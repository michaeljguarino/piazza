import React from 'react'
import { Query } from 'react-apollo'
import { Redirect } from 'react-router'
import gql from 'graphql-tag'
import MessageList from './conversation/MessageList'
import MessageInput from './conversation/MessageInput'
import ConversationPanel from './conversation/ConversationPanel'
import ConversationHeader from './conversation/ConversationHeader'
import {Box, Grid} from 'grommet'

const ME_Q=gql`
query {
  me {
    id
    name
    handle
    backgroundColor
  }
}
`
const CONVERSATIONS_Q = gql`
{
  conversations(public: true, first: 20) {
    edges {
      node {
        id
        name
      }
    }
  }
}
`

const Piazza = () => (
  <Query query={ME_Q}>
    { ({loading, error, data}) => {
      if (loading) {
        return (<div>Loading...</div>)
      }
      if (error || !data.me || !data.me.id) {
        return (<Redirect to='/login'/>)
      }
      let me = data.me
      return (
        <Query query={CONVERSATIONS_Q}>
          {({loading, _error, data}) => {
            if (loading) return <div>Loading...</div>
            let first = data.conversations.edges[0].node
            return (
              <Grid
                rows={['auto']}
                columns={['200px', 'auto']}
                areas={[
                  {name: 'convs', start: [0, 0], end: [0, 0]},
                  {name: 'msgs', start: [1, 0], end: [1, 0]},
                ]}
                >
                {/* <AppBar/> */}
                <Box gridArea='convs' background='brand' elevation='medium'>
                  <ConversationPanel me={me} currentConversation={first} conversations={data.conversations.edges} />
                </Box>
                <Box gridArea='msgs'>
                  <Box height='65px'>
                    <ConversationHeader conversation={first} />
                  </Box>
                  <MessageList conversation={first} />
                  <Box height='60px'>
                    <MessageInput conversation={first} />
                  </Box>
                </Box>
              </Grid>
            )
          }}
        </Query>
      )
    }}
  </Query>
)

export default Piazza