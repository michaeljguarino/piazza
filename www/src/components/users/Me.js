import React, { useContext, useCallback, useState } from 'react'
import { Box, Text, ThemeContext, Meter, Stack, Layer } from 'grommet'
import { User, Lock, Logout, Iteration } from 'grommet-icons'
import Avatar from './Avatar'
import { useMutation, useQuery } from 'react-apollo'
import { CloseableDropdown, ModalHeader, MenuItem, SubMenu, InterchangeableBox, HoveredBackground, Tooltip } from 'forge-core'
import { AUTH_TOKEN } from '../../constants'
import { FilePicker } from 'react-file-picker'
import { ME_Q, UPDATE_USER, PLAN_Q } from './queries'
import { CurrentUserContext } from '../login/EnsureLogin'
import UpdatePassword from './UpdatePassword'
import UpdateProfile from './UpdateProfile'
import Tools from '../tools/Tools'
import AdminTools from '../tools/AdminTools'
import Themes from '../workspace/Themes'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'
import UserStatus from './UserStatus'

export function DropdownItem({onClick, icon, text, ...rest}) {
  return (
    <MenuItem hover='focus' onClick={() => onClick && onClick()} {...rest}>
      <Box direction='row' align='center' gap='xsmall'>
        {icon && React.createElement(icon, {size: '12px'})}
        <Text size='small'>{text}</Text>
      </Box>
    </MenuItem>
  )
}

const _logout = () => {
  localStorage.removeItem(AUTH_TOKEN)
  window.location.href = "/login"
}

function UsageMeter({limit, usage, name}) {
  return (
    <Stack anchor='center'>
      <Meter
        size='xsmall'
        thickness='xsmall'
        type='circle'
        background='light-2'
        values={[{
          value: (usage / limit) * 100,
          color: 'focus'
        }]} />
      <Tooltip align={{bottom: 'top'}}>
        <Box pad={{bottom: 'xsmall'}} align='center' justify='center'>
          <Text size='xsmall' style={{cursor: 'pointer'}}>{name}</Text>
        </Box>
        <Text size='small'>{usage} / {limit} used</Text>
      </Tooltip>
    </Stack>
  )
}

function PlanDetails() {
  const {loading, data} = useQuery(PLAN_Q)
  if (loading || !data) return null

  const {license: {limits, plan}, usage} = data.plan
  return (
    <Box
      direction='row'
      border='top'
      align='center'
      fill='horizontal'
      pad='small'
      margin={{top: 'xsmall'}}
      gap='xsmall'>
      <Box width='60%' gap='xsmall'>
        <Text size='small'>You're subscribed to the {plan} plan</Text>
      </Box>
      <Box width='40%' align='center' justify='center'>
        <UsageMeter limit={limits.user} usage={usage.user} name='Users' />
      </Box>
    </Box>
  )
}

function MeDropdown({me, setModal, setOpen}) {
  const isAdmin = me.roles && me.roles.admin
  const openModal = useCallback((modal) => {
    setModal(modal)
    setOpen(false)
  }, [setModal, setOpen])

  return (
    <Box width="225px">
      <Box pad='small' direction="row" align="center">
        <Avatar user={me} rightMargin='10px' />
        <Text size="small" weight='bold'>{me.name}</Text>
      </Box>
      <InterchangeableBox hover='focus'>
      {setAlternate => (
        <>
        <Box pad={{bottom: 'xxsmall'}}>
          <UserStatus user={me} setModal={openModal} />
          <DropdownItem icon={User} text='update profile' onClick={() => openModal(
            <Box>
              <ModalHeader text='Update Profile' setOpen={openModal} />
              <Box gap='small' pad="medium" style={{minWidth: '400px'}}>
                <UpdateProfile callback={() => openModal(null)} me={me} />
              </Box>
            </Box>
          )} />
          <DropdownItem icon={Lock} text='change password' onClick={() => openModal(
            <Box width='400px'>
              <ModalHeader text='Update Password' setOpen={openModal} />
              <Box gap='small' pad="medium">
                <UpdatePassword callback={() => openModal(null)} me={me} />
              </Box>
            </Box>
          )} />
          <DropdownItem icon={Iteration} text='theme selector' onClick={() => openModal(
            <Themes setOpen={openModal} />
          )} />
          <SubMenu text='developer tools' hover='focus' setAlternate={setAlternate}>
            <Tools openModal={openModal} />
          </SubMenu>
          {isAdmin && (
            <SubMenu text='admin tools' hover='focus' setAlternate={setAlternate}>
              <AdminTools me={me} openModal={openModal} />
            </SubMenu>
          )}
          {isAdmin && (<PlanDetails />)}
        </Box>
        <Box border='top' pad={{vertical: 'xxsmall'}}>
          <MenuItem hover='focus' onClick={_logout}>
            <Box direction='row' align='center'>
              <Box width='100%'>
                <Text size='small'>logout</Text>
              </Box>
              <Logout size='12px' />
            </Box>
          </MenuItem>
        </Box>
        </>
      )}
      </InterchangeableBox>
    </Box>
  )
}

export const HEADER_HEIGHT = 65

function MeHeader({me: {id, handle, name}}) {
  return (
    <Box>
      <Box direction='row' gap='xsmall' align='center'>
        <Text size='small' weight='bold'>{"@" + handle}</Text>
        <WithPresence id={id}>
        {present => <PresenceIndicator present={present} />}
        </WithPresence>
      </Box>
      <Text size='small' color='dark-6'>{name}</Text>
    </Box>
  )
}

export default function Me({pad}) {
  const [modal, setModal] = useState(null)
  const [mutation] = useMutation(UPDATE_USER, {
    update: (cache, { data: { updateUser } }) => {
      const {me} = cache.readQuery({ query: ME_Q });
      cache.writeQuery({query: ME_Q, data: {me: {...me, ...updateUser}}});
    }
  })
  const me = useContext(CurrentUserContext)

  return (
    <>
    <ThemeContext.Extend value={{layer: {zIndex: 25}}}>
      <HoveredBackground>
        <Box
          sidebarHover
          accentText
          height={`${HEADER_HEIGHT}px`}
          style={{cursor: 'pointer'}}
          pad={{...pad, top: 'small', bottom: '7px'}}
          align='center'
          direction='row'>
          <Box direction='row' align='center' margin={{bottom: '5px'}}>
            <FilePicker
              extensions={['jpg', 'jpeg', 'png']}
              dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
              onChange={ (file) => mutation({variables: {id: me.id, attributes: {avatar: file}}})}>
              <span><Avatar user={me} rightMargin='10px' /></span>
            </FilePicker>
            <CloseableDropdown target={<MeHeader me={me} />}>
            {(setOpen) => (<MeDropdown me={me} setModal={setModal} setOpen={setOpen} />)}
            </CloseableDropdown>
          </Box>
        </Box>
      </HoveredBackground>
    </ThemeContext.Extend>
    {modal && (
      <Layer modal>
        {modal}
      </Layer>
    )}
    </>
  )
}