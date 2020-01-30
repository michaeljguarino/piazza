import React, { useState, useCallback } from 'react'
import MessageList from './messages/MessageList'
import AnchoredMessageList from './messages/AnchoredMessageList'
import MessageInput from './messages/MessageInput'
import ReplyProvider from './messages/ReplyProvider'
import VisibleMessages from './messages/VisibleMessages'
import MessageSubscription from './messages/MessageSubscription'
import ConversationPanel from './conversation/ConversationPanel'
import ConversationHeader from './conversation/ConversationHeader'
import {Box, Grid, Text} from 'grommet'
import {FlyoutProvider} from './utils/Flyout'
import {lastMessage} from './messages/VisibleMessages'
import {formatDate} from './messages/Message'
import { fromEvent } from 'file-selector'
import AppContext from './login/AppContext'


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

const DROP_BACKGROUND = 'rgba(255, 255, 255, 0.2)'
const FILE_DROP_PROPS = {
  border: {color: 'focus', style: 'dashed', size: '2px'},
  background: DROP_BACKGROUND
}

const cancel = (event) => { event.stopPropagation(); event.persist(); event.preventDefault() }

const Piazza = () => {
  const [anchor, setAnchor] = useState(null)
  const [attachment, setAttachment] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const onDrop = useCallback((files) => {
    setAttachment(files[0])
  }, [setAttachment])

  const dropProps = {
    onDragEnter: (e) => { cancel(e); setDragActive(true) },
    onDragOver: (e) => { cancel(e); setDragActive(true) },
    onDragLeave: (e) => { cancel(e); setDragActive(false) },
    onDrop: (event) => {
      cancel(event)
      Promise.resolve(fromEvent(event).then((files) => {
        onDrop(files)
      }));
      setDragActive(false)
    }
  }

  return (
    <VisibleMessages>
    {(visible, clear) => (
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
              <Box gridArea='msgs' {...(dragActive ? FILE_DROP_PROPS : {})} {...dropProps}>
                <Box height='60px' align='center'>
                  <ConversationHeader  setAnchor={setAnchor} />
                </Box>
                <ReplyProvider>
                  <Box
                    direction='row'
                    style={{height: '100%', width: '100%', maxHeight: 'calc(100vh - 60px)'}}
                    border='top'>
                    <Box width='100%' height='100%' align='center'>
                      <DividerText visible={visible} />
                      <Box id='msg-view' width='100%' height='100%'>
                      {anchor ? <AnchoredMessageList
                                  anchor={anchor}
                                  setAnchor={setAnchor} /> :
                                <MessageList />}
                      </Box>
                      <MessageInput attachment={attachment} setAttachment={setAttachment} />
                    </Box>
                    {flyoutContent}
                  </Box>
                </ReplyProvider>
              </Box>
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