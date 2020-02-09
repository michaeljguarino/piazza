import React, { useContext, useState, useRef } from 'react'
import HoveredBackground from '../utils/HoveredBackground'
import { Box, Text, Drop, ThemeContext } from 'grommet'
import { WorkspaceContext } from '../Workspace'
import { Conversations } from '../login/MyConversations'
import { Edit, Add } from 'grommet-icons'
import Modal, { ModalHeader } from '../utils/Modal'
import { useMutation } from 'react-apollo'
import { UPDATE_WORKSPACE, WORKSPACE_Q, CREATE_WORKSPACE } from './queries'
import Button from '../utils/Button'
import InputField from '../utils/InputField'
import { CurrentUserContext } from '../login/EnsureLogin'

const LABEL_SIZE = '100px'

function WorkspaceForm({attributes, setAttributes, onClick, loading, label}) {
  return (
    <Box pad='small' gap='small'>
      <InputField
        labelWidth={LABEL_SIZE}
        label='name'
        value={attributes.name}
        placeholder='a short name'
        onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
      <InputField
        labelWidth={LABEL_SIZE}
        label='description'
        value={attributes.description}
        placeholder='what you do in this workspace'
        onChange={({target: {value}}) => setAttributes({...attributes, description: value})} />
      <Box direction='row' justify='end'>
        <Button round='xsmall' loading={loading} label={label} onClick={onClick} />
      </Box>
    </Box>
  )
}

function EditWorkspace({workspace: {id, name, description}, setOpen}) {
  const [attributes, setAttributes] = useState({name, description})
  const [mutation, {loading}] = useMutation(UPDATE_WORKSPACE, {
    variables: {id, attributes},
    update: (cache, {data: {updateWorkspace}}) => {
      const {workspaces, ...prev} = cache.readQuery({query: WORKSPACE_Q})
      cache.writeQuery({
        query: WORKSPACE_Q,
        data: {...prev, workpaces: {...workspaces, edges: workspaces.edges.map(
          (edge) => edge.node.id === updateWorkspace.id ? {...edge, node: updateWorkspace} : edge
        )}}
      })
      setOpen(false)
    }
  })

  return (
    <Box width='50vw'>
      <ModalHeader text='Edit Workspace' setOpen={setOpen} />
      <WorkspaceForm
        label='Update'
        attributes={attributes}
        setAttributes={setAttributes}
        onClick={mutation}
        loading={loading} />
    </Box>
  )
}

function CreateWorkspace({setOpen}) {
  const [attributes, setAttributes] = useState({name: '', description: ''})
  const [mutation, {loading}] = useMutation(CREATE_WORKSPACE, {
    variables: {attributes},
    update: (cache, {data: {createWorkspace}}) => {
      const {workspaces, ...prev} = cache.readQuery({query: WORKSPACE_Q})
      cache.writeQuery({
        query: WORKSPACE_Q,
        data: {...prev, workspaces: {
          ...workspaces,
          edges: [{__typename: "WorkspaceEdge", node: createWorkspace}, ...workspaces.edges]
        }}
      })
      setOpen(false)
    }
  })

  return (
    <Box width='50vw'>
      <ModalHeader text='Create Workspace' setOpen={setOpen} />
      <WorkspaceForm
        label='Create'
        attributes={attributes}
        setAttributes={setAttributes}
        onClick={mutation}
        loading={loading} />
    </Box>
  )
}

function Workspace({workspace, workspaceId, me, setWorkspace}) {
  const [hover, setHover] = useState(false)
  const selected = workspace.id === workspaceId
  const admin = me.roles && me.roles.admin

  return (
    <Box
      direction='row'
      justify='end'
      align='center'
      style={!selected ? {cursor: 'pointer'} : null}
      pad='small'
      background={(hover && !selected) ? 'light-3' : null}
      border={selected ? {side: 'right', size: '2px', color: 'focus'} : null}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <Box width='100%' onClick={() => setWorkspace(workspace)}>
        <Text size='small' style={{fontWeight: 500}}>{workspace.name}</Text>
        {workspace.description && <Text size='small'><i>{workspace.description}</i></Text>}
      </Box>
      {hover && admin && (
        <Modal target={
          <HoveredBackground>
            <Box style={{cursor: 'pointer'}} accentable width='20px' align='center' justify='center'>
              <Edit size='14px' />
            </Box>
          </HoveredBackground>
        }>
        {setOpen => (<EditWorkspace workspace={workspace} setOpen={setOpen} />)}
        </Modal>
      )}
    </Box>
  )
}

function CreateTarget() {
  return (
    <HoveredBackground>
      <Box accentable style={{cursor: 'pointer'}} fill='horizontal' margin='small' direction='row' align='center' gap='small'>
        <Add size='14px' />
        <Text size='small'>create another workspace</Text>
      </Box>
    </HoveredBackground>
  )
}

function WorkspaceDropdown({dropRef, workspaces, setOpen, workspaceId, setWorkspace}) {
  const me = useContext(CurrentUserContext)

  return (
    <Drop target={dropRef.current} align={{bottom: 'top'}} onClickOutside={() => setOpen(false)}>
      <Box width='300px' pad={{vertical: 'small'}}>
        <Box fill='horizontal' margin='small' direction='row'>
          <Text size='small' style={{fontWeight: 500}}>Switch Workspaces</Text>
        </Box>
        {workspaces.map((workspace) => (
          <Workspace
            key={workspace.id}
            me={me}
            workspaceId={workspaceId}
            workspace={workspace}
            setWorkspace={setWorkspace} />
        ))}
        {me.roles.admin && (
          <Modal target={<CreateTarget />}>
          {setOpen => <CreateWorkspace setOpen={setOpen} />}
          </Modal>
        )}
      </Box>
    </Drop>
  )
}

export const FOOTER_HEIGHT = 60

export default function Workspaces({pad}) {
  const [open, setOpen] = useState(false)
  const dropRef = useRef()
  const {workspaces} = useContext(WorkspaceContext)
  const {workspaceId, setWorkspace} = useContext(Conversations)

  const current = workspaces.find(({id}) => id === workspaceId)

  return (
    <ThemeContext.Extend value={{layer: {zIndex: 25}}}>
      {open && (
        <WorkspaceDropdown
          dropRef={dropRef}
          workspaceId={workspaceId}
          setWorkspace={setWorkspace}
          workspaces={workspaces}
          setOpen={setOpen} />
      )}
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
    </ThemeContext.Extend>
  )
}