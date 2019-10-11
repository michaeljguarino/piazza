import React, {useState} from 'react'
import MessageList from './messages/MessageList'
import AnchoredMessageList from './messages/AnchoredMessageList'
import MessageInput from './messages/MessageInput'
import ReplyProvider from './messages/ReplyProvider'
import VisibleMessages from './messages/VisibleMessages'
import MessageSubscription from './messages/MessageSubscription'
import ConversationPanel from './conversation/ConversationPanel'
import ConversationHeader from './conversation/ConversationHeader'
import CurrentUser from './login/EnsureLogin'
import MyConversations from './login/MyConversations'
import EmojiProvider from './emoji/EmojiProvider'
import {Box, Grid, Text} from 'grommet'
import {FlyoutProvider} from './utils/Flyout'
import {lastMessage} from './messages/VisibleMessages'
import {formatDate} from './messages/Message'

export const ICON_HEIGHT = '20px'
export const ICON_SPREAD = '9px'

function DividerText(props) {
  const last = lastMessage(props.visible)
  if (!last) return null

  return (
    <Box style={{
        zIndex: 5,
        marginTop: '-11px',
        position: 'absolute',
        top: 60,
      }} background='#fff' pad={{horizontal: '8px'}}>
      <Text style={{fontWeight: 500}} size='small'>
        {formatDate(last.insertedAt)}
      </Text>
    </Box>
  )
}

const Piazza = () => {
  const [anchor, setAnchor] = useState(null)
  return (
    <CurrentUser>
    {me => (
      <EmojiProvider>
        <FlyoutProvider>
        {(flyoutContent) => (
          <VisibleMessages>
          {(visible, clear) => (
            <MyConversations sideEffects={[() => setAnchor(null), clear]}>
            {(currentConversation, conversations, chats, setCurrentConversation, loadMore, waterline, setWaterline) => (
              <Grid
                rows={['100vh']}
                columns={['200px', 'auto']}
                areas={[
                  {name: 'convs', start: [0, 0], end: [0, 0]},
                  {name: 'msgs', start: [1, 0], end: [1, 0]},
                ]}>
                <MessageSubscription currentConversation={currentConversation} me={me}>
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
                    <Box height='60px' align='center'>
                      <ConversationHeader
                        conversation={currentConversation}
                        setCurrentConversation={setCurrentConversation}
                        setAnchor={setAnchor} />
                    </Box>
                    <ReplyProvider>
                    {(reply, setReply) => (
                      <Box
                        direction='row'
                        style={{height: '100%', width: '100%', maxHeight: 'calc(100vh - 60px)'}}
                        border='top'>
                        <Box width='100%' height='100%' align='center'>
                          <DividerText visible={visible} />
                          <Box id='msg-view' width='100%' height='100%'>
                          {anchor ? <AnchoredMessageList
                                      anchor={anchor}
                                      conversation={currentConversation}
                                      setReply={setReply}
                                      setAnchor={setAnchor} /> :
                                    <MessageList
                                      setReply={setReply}
                                      waterline={waterline}
                                      conversation={currentConversation} />}
                          </Box>
                          <MessageInput
                            reply={reply}
                            setReply={setReply}
                            setWaterline={setWaterline}
                            conversation={currentConversation} />
                        </Box>
                        {flyoutContent}
                      </Box>
                    )}
                    </ReplyProvider>
                  </Box>
                </MessageSubscription>
              </Grid>
            )}
            </MyConversations>
          )}
          </VisibleMessages>
        )}
        </FlyoutProvider>
      </EmojiProvider>
    )}
    </CurrentUser>
  )
}

export default Piazza