import React, { useContext, useState, useRef, useCallback } from 'react'
import { Box, Text, Drop, ThemeContext, Layer } from 'grommet'
import { Loading, ModalHeader, Button, InputField, HoveredBackground } from 'forge-core'
import { WorkspaceContext } from '../Workspace'
import { Conversations } from '../login/MyConversations'
import { Edit, Add } from 'grommet-icons'
import { useMutation, useQuery } from 'react-apollo'
import { UPDATE_WORKSPACE, CREATE_WORKSPACE, WORKSPACE_Q } from './queries'
import { CurrentUserContext } from '../login/EnsureLogin'
import { NotificationBadge } from '../conversation/Conversation'
import { addWorkspace } from './utils'
import { AvatarContainer } from '../users/Avatar'
import { FilePicker } from 'react-file-picker'

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
    onCompleted: () => setOpen(false)
  })

  return (
    <Box width='40vw'>
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
  const [attributes, setAttributes] = useState({name: '', description: '', icon: null})
  const [mutation, {loading}] = useMutation(CREATE_WORKSPACE, {
    variables: {attributes},
    update: (cache, {data: {createWorkspace}}) => {
      addWorkspace(cache, createWorkspace)
      setOpen(false)
    }
  })

  return (
    <Box width='40vw'>
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

function WorkspaceIcon({workspace: {icon, name}}) {
  return (
    <AvatarContainer img={icon} text={name} />
  )
}

function UploadableIcon({workspace}) {
  const [mutation] = useMutation(UPDATE_WORKSPACE, {variables: {id: workspace.id}})
  return (
    <FilePicker
      extensions={['jpg', 'jpeg', 'png']}
      dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
      onChange={ (file) => mutation({variables: {attributes: {icon: file}}})}
    >
      <span style={{cursor: 'pointer'}}><WorkspaceIcon workspace={workspace} /></span>
    </FilePicker>
  )
}

function Workspace({workspace, workspaceId, me, setWorkspace, setModal}) {
  const [hover, setHover] = useState(false)
  const selected = workspace.id === workspaceId
  const admin = me.roles && me.roles.admin

  return (
    <Box
      direction='row'
      justify='end'
      align='center'
      focusIndicator={false}
      pad='small'
      gap='small'
      background={(hover && !selected) ? 'light-3' : null}
      border={selected ? {side: 'right', size: '2px', color: 'focus'} : null}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={selected ? null : () => setWorkspace(workspace)}>
      <Box flex={false} onClick={(e) => {e.stopPropagation();}}>
        <UploadableIcon workspace={workspace} />
      </Box>
      <Box fill direction='row' align='center' gap='small'>
        <Box fill justify='center'>
          <Text size='small' weight={500} truncate>{workspace.name}</Text>
          {workspace.description && <Text size='small' truncate><i>{workspace.description}</i></Text>}
        </Box>
        {workspace.unreadNotifications > 0 && !hover && (<NotificationBadge unread={workspace.unreadNotifications} />)}
      </Box>
      {hover && admin && (
        <HoveredBackground>
          <Box flex={false} focusIndicator={false} accentable width='40px' align='center' justify='center'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setModal(
                <Layer modal onClickOutside={() => setModal(null)}>
                  <EditWorkspace workspace={workspace} setOpen={setModal} />
                </Layer>
              )
            }}>
            <Edit size='14px' />
          </Box>
        </HoveredBackground>
      )}
    </Box>
  )
}

function CreateTarget({onClick}) {
  return (
    <HoveredBackground>
      <Box
        accentable focusIndicator={false}  onClick={onClick} fill='horizontal'
        margin='small' direction='row' align='center' gap='xsmall'>
        <Add size='14px' />
        <Text size='small'>create another workspace</Text>
      </Box>
    </HoveredBackground>
  )
}

function WorkspaceDropdown({workspaceId, setWorkspace, setModal}) {
  const me = useContext(CurrentUserContext)
  const {data} = useQuery(WORKSPACE_Q, {fetchPolicy: 'cache-and-network'})

  if (!data) return (<Box width='300px' height='100px'><Loading /></Box>)

  return (
    <Box width='300px' pad={{vertical: 'small'}}>
      <Box fill='horizontal' margin='small' direction='row'>
        <Text size='small' weight={500}>Switch Workspaces</Text>
      </Box>
      {data.workspaces.edges.map(({node: workspace}) => (
        <Workspace
          key={workspace.id}
          me={me}
          workspaceId={workspaceId}
          workspace={workspace}
          setWorkspace={setWorkspace}
          setModal={setModal} />
      ))}
      {me.roles && me.roles.admin && (
        <CreateTarget onClick={() => setModal(
          <CreateWorkspace setOpen={setModal} />
        )} />
      )}
    </Box>
  )
}

export const FOOTER_HEIGHT = 60

export default function Workspaces({pad}) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(false)
  const dropRef = useRef()
  const {workspaces} = useContext(WorkspaceContext)
  const {workspaceId, setWorkspace} = useContext(Conversations)

  const current = workspaces.find(({id}) => id === workspaceId)
  const notifs = workspaces.filter(({id}) => id !== workspaceId)
                  .reduce((sum, {unreadNotifications}) => sum + (unreadNotifications || 0), 0)
  const doSetOpen = useCallback((o) => modal ? null : setOpen(o), [modal, setOpen])

  return (
    <ThemeContext.Extend value={{layer: {zIndex: 25}}}>
      {open && (
        <Drop target={dropRef.current} align={{bottom: 'top'}} onClickOutside={() => setOpen(false)}>
          <WorkspaceDropdown
            workspaceId={workspaceId}
            setWorkspace={setWorkspace}
            setOpen={doSetOpen}
            setModal={setModal} />
        </Drop>
      )}
      <HoveredBackground>
        <Box ref={dropRef} sidebarHover accentText onClick={() => setOpen(!open)}
             height={`${FOOTER_HEIGHT}px`} focusIndicator={false} pad={{...pad, right: 'small', vertical: 'small'}}
             align='center' justify='end' direction='row'>
          <Box direction='row' gap='small' width='100%' align='center'>
            <WorkspaceIcon workspace={current} />
            <Text size='small' weight={500}>{current.name}</Text>
          </Box>
          {notifs > 0 && <NotificationBadge unread={notifs} />}
        </Box>
        {modal && (
          <Layer modal onClickOutside={() => setModal(null)}>
            {modal}
          </Layer>
        )}
      </HoveredBackground>
    </ThemeContext.Extend>
  )
}