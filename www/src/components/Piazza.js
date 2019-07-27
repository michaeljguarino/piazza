import React from 'react'
import { Query } from 'react-apollo'
import { Redirect } from 'react-router'
import gql from 'graphql-tag'
import MessageList from './conversation/MessageList'
import MessageInput from './conversation/MessageInput'
import Conversations from './conversation/Conversations'
import {Box, Grid} from 'grommet'

const ME_Q=gql`
query {
  me {
    id
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

      return (
        <Query query={CONVERSATIONS_Q}>
          {({loading, _error, data}) => {
            if (loading) return <div>Loading...</div>
            let first = data.conversations.edges[0].node
            return (
              <Grid
                gap='xsmall'
                rows={['auto']}
                columns={['150px', 'auto']}
                areas={[
                  {name: 'convs', start: [0, 0], end: [0, 0]},
                  {name: 'msgs', start: [1, 0], end: [1, 0]},
                  // {name: 'notifs', start: [2, 0], end: [2, 0]}
                ]}
                >
                {/* <AppBar/> */}
                <Box gridArea='convs' background='brand' elevation='small'>
                  <Conversations conversations={data.conversations.edges} />
                </Box>
                <Box gridArea='msgs'>
                  <MessageInput conversation={first} />
                  <MessageList conversation={first} />
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