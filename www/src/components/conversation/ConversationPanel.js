import React from 'react'
import Conversation from './Conversation'
import Me from '../users/Me'
import { Box, Text } from 'grommet'
import ConversationCreator, { CreateConversation } from './ConversationCreator'
import Chats from './Chats'
import Scroller from '../utils/Scroller'
import {mergeAppend} from '../../utils/array'
import Flyout from '../utils/Flyout'
import HoveredBackground from '../utils/HoveredBackground'
import { Terminal, Group } from 'grommet-icons'
import { UserFlyout } from '../users/Users'
import { CommandFlyout } from '../commands/Commands'
import { ExternalInvite } from './MagicLinkInvite'

const PADDING = {left: '15px'}

function SidebarFlyout({icon, text, children}) {
  return (
    <Flyout target={
      <HoveredBackground>
        <Box
          highlight
          direction='row'
          style={{cursor: 'pointer'}}
          align='center'
          gap='xsmall'
          pad={PADDING}>
          {React.createElement(icon, {color: 'sidebarText', size: '12px'})}
          <Text color='sidebarText' size='small'>{text}</Text>
        </Box>
      </HoveredBackground>}>
    {setOpen => children(setOpen)}
    </ Flyout>
  )
}

export default function ConversationPanel({me, setCurrentConversation, conversations, chats, currentConversation, pageInfo, loadMore}) {
  return (
    <Box>
      <Me me={me} pad={PADDING} />
      <Box margin={{vertical: 'medium'}} gap='xsmall'>
        <SidebarFlyout icon={Group} text='Directory'>
        {setOpen => <UserFlyout setOpen={setOpen} />}
        </SidebarFlyout>
        <SidebarFlyout icon={Terminal} text='Apps'>
        {setOpen => <CommandFlyout setOpen={setOpen} />}
        </SidebarFlyout>
      </Box>
      <Box margin={{bottom: 'small'}}>
        <ConversationCreator
          padding={PADDING}
          setCurrentConversation={setCurrentConversation} />
        <Scroller
          id='conversations-list'
          style={{
            overflow: 'auto',
            maxHeight: '40vh'
          }}
          edges={conversations}
          onLoadMore={() => {
            if (!pageInfo.hasNextPage) return

            loadMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: (prev, {fetchMoreResult}) => {
                const edges = fetchMoreResult.conversations.edges
                const pageInfo = fetchMoreResult.conversations.pageInfo

                return edges.length ? {
                  ...prev,
                  conversations: {
                    ...prev.conversations,
                    pageInfo,
                    edges: mergeAppend(edges, prev.conversations.edges, (e) => e.node.id),
                  }
                } : prev;
              }
            })}}
          mapper={(edge) => <Conversation
            pad={{...PADDING, vertical: 'small'}}
            key={edge.node.id}
            currentConversation={currentConversation}
            setCurrentConversation={setCurrentConversation}
            conversation={edge.node} />
          } />
      </Box>
      <Box margin={{bottom: 'medium'}}>
        <CreateConversation pad={PADDING} />
      </Box>
      <Chats
        pad={{...PADDING, vertical: 'small'}}
        currentConversation={currentConversation}
        setCurrentConversation={setCurrentConversation}
        chats={chats}
      />
      <ExternalInvite>
        <HoveredBackground>
          <Box direction='row' margin={{vertical: 'small'}} pad={PADDING}>
            <Text
              highlight
              style={{cursor: 'pointer'}}
              size='small'
              color='sidebarText'>
              + Invite someone else
            </Text>
          </Box>
        </HoveredBackground>
      </ExternalInvite>
    </Box>
  )
}