import React, { useContext, useState, useRef } from 'react'
import HoveredBackground from '../utils/HoveredBackground'
import { Box, Text, Drop } from 'grommet'
import { WorkspaceContext } from '../Workspace'
import { Conversations } from '../login/MyConversations'


function Workspace({workspace}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      pad='small'
      background={hover ? 'light-3' : null}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <Text size='small' style={{fontWeight: 500}}>{workspace.name}</Text>
      {workspace.description && <Text size='small'><i>{workspace.description}</i></Text>}
    </Box>
  )
}


function WorkspaceDropdown({dropRef, workspaces}) {
  console.log(workspaces)
  return (
    <Drop target={dropRef.current} align={{bottom: 'top'}}>
      <Box pad={{vertical: 'small'}}>
        {workspaces.map((workspace) => <Workspace key={workspace.id} workspace={workspace} />)}
      </Box>
    </Drop>
  )
}

export const FOOTER_HEIGHT = 60

export default function Workspaces({pad}) {
  const [open, setOpen] = useState(false)
  const dropRef = useRef()
  const {workspaces} = useContext(WorkspaceContext)
  const {workspaceId} = useContext(Conversations)
  const current = workspaces.find(({id}) => id === workspaceId)

  return (
    <>
    {open && <WorkspaceDropdown dropRef={dropRef} workspaces={workspaces} />}
    <HoveredBackground>
      <Box
        ref={dropRef}
        onClick={() => setOpen(!open)}
        sidebarHover
        accentText
        height={`${FOOTER_HEIGHT}px`}
        style={{cursor: 'pointer'}}
        pad={{...pad, top: 'small', bottom: '7px'}}
        align='center'
        direction='row'>
        <Text size='small' weight='bold'>{current.name}</Text>
      </Box>
    </HoveredBackground>
    </>
  )
}