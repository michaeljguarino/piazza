import React, { useContext, useEffect } from 'react'
import Me, { HEADER_HEIGHT } from '../users/Me'
import { Box, Text } from 'grommet'
import ConversationCreator, { CreateConversation } from './ConversationCreator'
import Flyout from '../utils/Flyout'
import HoveredBackground from '../utils/HoveredBackground'
import { Terminal, Group } from 'grommet-icons'
import { UserFlyout } from '../users/Users'
import { CommandFlyout } from '../commands/Commands'
import { ExternalInvite } from './MagicLinkInvite'
import { CurrentUserContext } from '../login/EnsureLogin'
import { Conversations } from '../login/MyConversations'
import ConversationPager from './ConversationPager'
import ChatCreator from './ChatCreator'
import Workspaces, { FOOTER_HEIGHT } from '../workspace/Workspaces'
import AvailabilityDetector, { OFFLINE } from '../utils/AvailabilityDetector'

export const PADDING = {left: '15px'}

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

function BackOnline({refetch, status}) {
  useEffect(() => {
    refetch()
  }, [status])
  return null
}

export default function ConversationPanel() {
  const me = useContext(CurrentUserContext)
  const {conversations, chats, setCurrentConversation, currentConversation, fetchMore, refetch} = useContext(Conversations)
  return (
    <Box>
      <AvailabilityDetector>
      {status => status !== OFFLINE && <BackOnline refetch={refetch} status={status} />}
      </AvailabilityDetector>
      <Me me={me} pad={PADDING} />
      <div style={{height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`, overflow: 'auto'}}>
        <Box margin={{vertical: 'medium'}} gap='xsmall'>
          <SidebarFlyout icon={Group} text='Directory'>
          {setOpen => <UserFlyout setOpen={setOpen} />}
          </SidebarFlyout>
          <SidebarFlyout icon={Terminal} text='Bots'>
          {setOpen => <CommandFlyout setOpen={setOpen} />}
          </SidebarFlyout>
        </Box>
        <Box margin={{bottom: 'small'}}>
          <ConversationCreator
            padding={PADDING}
            setCurrentConversation={setCurrentConversation} />
          <ConversationPager
            {...conversations}
            type='conversations'
            fetchMore={fetchMore}
            currentConversation={currentConversation}
            setCurrentConversation={setCurrentConversation} />
        </Box>
        <Box margin={{bottom: 'medium'}}>
          <CreateConversation pad={PADDING} />
        </Box>
        <Box>
          <ChatCreator padding={PADDING} setCurrentConversation={setCurrentConversation} />
          <ConversationPager
            {...chats}
            type='chats'
            fetchMore={fetchMore}
            currentConversation={currentConversation}
            setCurrentConversation={setCurrentConversation} />
        </Box>
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
      </div>
      <Workspaces pad={PADDING} />
    </Box>
  )
}