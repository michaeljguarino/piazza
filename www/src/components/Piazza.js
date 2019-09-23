import React, {useState} from 'react'
import MessageList from './messages/MessageList'
import AnchoredMessageList from './messages/AnchoredMessageList'
import MessageInput from './messages/MessageInput'
import ReplyProvider from './messages/ReplyProvider'
import ConversationPanel from './conversation/ConversationPanel'
import ConversationHeader from './conversation/ConversationHeader'
import CurrentUser from './login/EnsureLogin'
import MyConversations from './login/MyConversations'
import EmojiProvider from './emoji/EmojiProvider'
import {Box, Grid} from 'grommet'
import {FlyoutProvider} from './utils/Flyout'

const Piazza = () => {
  const [anchor, setAnchor] = useState(null)
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
      <EmojiProvider>
        <FlyoutProvider>
        {(flyoutContent) => (
          <MyConversations sideEffects={[() => setAnchor(null)]}>
          {(currentConversation, conversations, chats, setCurrentConversation, loadMore) => (
            <Grid
              rows={['100vh']}
              columns={['200px', 'auto']}
              areas={[
                {name: 'convs', start: [0, 0], end: [0, 0]},
                {name: 'msgs', start: [1, 0], end: [1, 0]},
              ]}>
              <Box gridArea='convs' background='sidebar' elevation='xsmall'>
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
                  <ConversationHeader
                    conversation={currentConversation}
                    setCurrentConversation={setCurrentConversation}
                    setAnchor={setAnchor} />
                </Box>
                <ReplyProvider>
                {(reply, setReply) => (
                  <Box style={{height: 'calc(100vh - 70px)', maxHeight: 'calc(100vh - 70px)'}}>
                    <Box height='100%' direction='row'>
                      {anchor ? <AnchoredMessageList
                                  anchor={anchor}
                                  textHeight={textHeight}
                                  conversation={currentConversation}
                                  setReply={setReply}
                                  setAnchor={setAnchor} /> :
                                <MessageList
                                  textHeight={textHeight}
                                  setReply={setReply}
                                  conversation={currentConversation} />}
                      {flyoutContent}
                    </Box>
                    <MessageInput
                      height={textHeight}
                      incrementHeight={incrementHeight}
                      resetHeight={resetHeight}
                      reply={reply}
                      setReply={setReply}
                      conversation={currentConversation} />
                  </Box>
                )}
                </ReplyProvider>
              </Box>
            </Grid>
          )}
          </MyConversations>
        )}
        </FlyoutProvider>
      </EmojiProvider>
    )}
    </CurrentUser>
  )
}

export default Piazza