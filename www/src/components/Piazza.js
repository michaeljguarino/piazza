import React from 'react'
import MessageList from './messages/MessageList'
import MessageInput from './messages/MessageInput'
import ConversationPanel from './conversation/ConversationPanel'
import ConversationHeader from './conversation/ConversationHeader'
import CurrentUser from './login/EnsureLogin'
import MyConversations from './login/MyConversations'
import {Box, Grid} from 'grommet'

const Piazza = () => {
  return (
    <CurrentUser>
    {me => (
      <MyConversations>
      {(currentConversation, conversations, setCurrentConversation, loadMore) => (
        <Grid
          rows={['100vh']}
          columns={['200px', 'auto']}
          areas={[
            {name: 'convs', start: [0, 0], end: [0, 0]},
            {name: 'msgs', start: [1, 0], end: [1, 0]},
          ]}>
          <Box gridArea='convs' background='brand' elevation='medium'>
            <ConversationPanel
              currentConversation={currentConversation}
              conversations={conversations.edges}
              setCurrentConversation={setCurrentConversation}
              loadMore={loadMore}
              pageInfo={conversations.pageInfo}
              />
          </Box>
          <Box gridArea='msgs'>
            <Box height='70px'>
              <ConversationHeader conversation={currentConversation} setCurrentConversation={setCurrentConversation} />
            </Box>
            <MessageList conversation={currentConversation} />
            <Box height='70px'>
              <MessageInput conversation={currentConversation} />
            </Box>
          </Box>
        </Grid>
      )}
      </MyConversations>
    )}
    </CurrentUser>
  )
}

export default Piazza