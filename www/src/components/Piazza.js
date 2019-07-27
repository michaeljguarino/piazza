import React, {useState} from 'react'
import { Query } from 'react-apollo'
import { Redirect } from 'react-router'
import gql from 'graphql-tag'
import MessageList from './conversation/MessageList'
import MessageInput from './conversation/MessageInput'
import ConversationPanel from './conversation/ConversationPanel'
import ConversationHeader from './conversation/ConversationHeader'
import Loading from './utils/Loading'
import {wipeToken} from '../helpers/authentication'
import {Box, Grid} from 'grommet'
import {CONVERSATIONS_Q} from './conversation/queries'

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

const Piazza = () => {
  const [currentConversation, setCurrentConversation] = useState(null)

  return (
    <Query query={ME_Q}>
      { ({loading, error, data}) => {
        if (loading) {
          return (<Loading/>)
        }
        if (error || !data.me || !data.me.id) {
          wipeToken()
          return (<Redirect to='/login'/>)
        }
        let me = data.me
        return (
          <Query query={CONVERSATIONS_Q}>
            {({loading, _error, data}) => {
              if (loading) return <Loading />
              let current = currentConversation || data.conversations.edges[0].node
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
                    <ConversationPanel
                      me={me}
                      currentConversation={current}
                      conversations={data.conversations.edges}
                      setCurrentConversation={setCurrentConversation}
                      />
                  </Box>
                  <Box gridArea='msgs'>
                    <Box height='75px'>
                      <ConversationHeader conversation={current} setCurrentConversation={setCurrentConversation} />
                    </Box>
                    <MessageList conversation={current} />
                    <Box height='60px'>
                      <MessageInput conversation={current} />
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
}

export default Piazza