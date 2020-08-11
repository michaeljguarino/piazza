import React, { useState, useContext } from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend, NativeTypes } from 'react-dnd-html5-backend'
import { FlyoutProvider } from 'forge-core'
import MessageList, { DialogProvider } from './messages/MessageList'
import AnchoredMessageList from './messages/AnchoredMessageList'
import MessageInput from './messages/MessageInput'
import ReplyProvider from './messages/ReplyProvider'
import VisibleMessages, { VisibleMessagesContext } from './messages/VisibleMessages'
import MessageSubscription from './messages/MessageSubscription'
import ConversationPanel from './conversation/ConversationPanel'
import ConversationHeader from './conversation/ConversationHeader'
import { Box, Grid, Text } from 'grommet'
import { formatDate } from './messages/Message'
import AppContext from './login/AppContext'


export const ICON_HEIGHT = '20px'
export const ICON_SPREAD = '9px'

function DividerText() {
  const {lastMessage} = useContext(VisibleMessagesContext)
  if (!lastMessage) return null

  return (
    <Box style={{
        zIndex: 5,
        marginTop: '-11px',
        position: 'absolute',
        top: 60,
      }} background='#fff' pad={{horizontal: '8px'}}>
      <Text style={{fontWeight: 500}} size='small'>
        {formatDate(lastMessage.insertedAt)}
      </Text>
    </Box>
  )
}

const DROP_BACKGROUND = 'rgba(255, 255, 255, 0.2)'
const FILE_DROP_PROPS = {
  border: {color: 'focus', style: 'dashed', size: '2px'},
  background: DROP_BACKGROUND
}

function Dropzone({children, setAttachment}) {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop: ({files}) => setAttachment(files[0]),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })
  const dragActive = canDrop && isOver

  return (
    <Box ref={drop} gridArea='msgs' {...(dragActive ? FILE_DROP_PROPS : {})}>
      {children}
    </Box>
  )
}

const Piazza = () => {
  const [anchor, setAnchor] = useState(null)
  const [attachment, setAttachment] = useState(null)

  return (
    <VisibleMessages>
    {(clear) => (
      <AppContext sideEffects={[() => setAnchor(null), clear]}>
        <FlyoutProvider>
        {(flyoutContent) => (
          <Grid
            rows={['100vh']}
            columns={['220px', 'auto']}
            areas={[
              {name: 'convs', start: [0, 0], end: [0, 0]},
              {name: 'msgs', start: [1, 0], end: [1, 0]},
            ]}>
            <MessageSubscription>
              <Box gridArea='convs' background='sidebar' elevation='xsmall'>
                <ConversationPanel />
              </Box>
              <DndProvider backend={HTML5Backend}>
              <Dropzone setAttachment={setAttachment}>
                <Box height='60px' align='center'>
                  <ConversationHeader  setAnchor={setAnchor} />
                </Box>
                <ReplyProvider>
                  <Box
                    direction='row'
                    style={{height: '100%', width: '100%', maxHeight: 'calc(100vh - 60px)'}}
                    border={{side: 'top', color: 'light-6'}}>
                    <Box width='100%' height='100%' align='center'>
                      <DividerText />
                      <Box id='msg-view' width='100%' height='100%'>
                        <DialogProvider>
                        {anchor ? <AnchoredMessageList
                                    anchor={anchor}
                                    setAnchor={setAnchor} /> :
                                  <MessageList />}
                        </DialogProvider>
                      </Box>
                      <MessageInput attachment={attachment} setAttachment={setAttachment} />
                    </Box>
                    {flyoutContent}
                  </Box>
                </ReplyProvider>
              </Dropzone>
              </DndProvider>
            </MessageSubscription>
          </Grid>
        )}
        </FlyoutProvider>
      </AppContext>
    )}
    </VisibleMessages>
  )
}

export default Piazza