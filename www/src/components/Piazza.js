import React, {useState} from 'react'
import { Query } from 'react-apollo'
import { Redirect } from 'react-router'
import MessageList from './conversation/MessageList'
import MessageInput from './conversation/MessageInput'
import ConversationPanel from './conversation/ConversationPanel'
import ConversationHeader from './conversation/ConversationHeader'
import Loading from './utils/Loading'
import {wipeToken} from '../helpers/authentication'
import {Box, Grid} from 'grommet'
import {CONVERSATIONS_Q} from './conversation/queries'
import {ME_Q} from './users/queries'
import {updateUnreadMessages} from './conversation/utils'
import {client} from '../helpers/client'

const Piazza = () => {
  const [currentConversation, setCurrentConversation] = useState(null)
  const wrappedSetCurrentConversation = (conv) => {
    if (conv) {
      updateUnreadMessages(client, conv.id, () => 0)
    }
    setCurrentConversation(conv)
  }
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
          <Query query={CONVERSATIONS_Q} pollInterval={30000}>
            {({loading, _error, data, loadMore}) => {
              if (loading) return <Loading />
              let current = currentConversation || data.conversations.edges[0].node
              return (
                <Grid
                  rows={['100vh']}
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
                      setCurrentConversation={wrappedSetCurrentConversation}
                      loadMore={loadMore}
                      pageInfo={data.conversations.pageInfo}
                      />
                  </Box>
                  <Box gridArea='msgs'>
                    <Box height='75px'>
                      <ConversationHeader me={me} conversation={current} setCurrentConversation={wrappedSetCurrentConversation} />
                    </Box>
                    <MessageList conversation={current} />
                    <Box height='70px'>
                      <MessageInput me={me} conversation={current} />
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