import React, {useState} from 'react'
import MessageList from './messages/MessageList'
import MessageInput from './messages/MessageInput'
import ConversationPanel from './conversation/ConversationPanel'
import ConversationHeader from './conversation/ConversationHeader'
import CurrentUser from './login/EnsureLogin'
import MyConversations from './login/MyConversations'
import {Box, Grid} from 'grommet'

const Piazza = () => {
  const [textHeight, setTextHeight] = useState(70)

  const incrementHeight = () => {
    if (textHeight >= 210) {
      return
    }
    setTextHeight(textHeight + 20)
  }
  const resetHeight = () => setTextHeight(70)
  return (
    <CurrentUser>
    {me => (
      <MyConversations>
      {(currentConversation, conversations, chats, setCurrentConversation, loadMore) => (
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
              chats={chats}
              setCurrentConversation={setCurrentConversation}
              loadMore={loadMore}
              pageInfo={conversations.pageInfo}
              />
          </Box>
          <Box gridArea='msgs'>
            <Box height='70px'>
              <ConversationHeader conversation={currentConversation} setCurrentConversation={setCurrentConversation} />
            </Box>
            <MessageList textHeight={textHeight} conversation={currentConversation} />
            <MessageInput
              height={textHeight}
              incrementHeight={incrementHeight}
              resetHeight={resetHeight}
              conversation={currentConversation} />
          </Box>
        </Grid>
      )}
      </MyConversations>
    )}
    </CurrentUser>
  )
}

export default Piazza