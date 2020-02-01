import React, { useContext } from 'react'
import { Box, Text, ThemeContext } from 'grommet'
import { User, Lock, Logout, Iteration } from 'grommet-icons'
import Avatar from './Avatar'
import { useMutation } from 'react-apollo'
import CloseableDropdown from '../utils/CloseableDropdown'
import Modal, { ModalHeader } from '../utils/Modal'
import { AUTH_TOKEN } from '../../constants'
import MenuItem, { SubMenu } from '../utils/MenuItem'
import InterchangeableBox from '../utils/InterchangeableBox'
import HoveredBackground from '../utils/HoveredBackground'
import { FilePicker } from 'react-file-picker'
import { ME_Q, UPDATE_USER } from './queries'
import { CurrentUserContext } from '../login/EnsureLogin'
import UpdatePassword from './UpdatePassword'
import UpdateProfile from './UpdateProfile'
import Tools from '../tools/Tools'
import AdminTools from '../tools/AdminTools'
import Themes from '../themes/Themes'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'

export function DropdownItem(props) {
  const {onClick, ...rest} = props
  return (
    <MenuItem onClick={() => onClick && onClick()} {...rest}>
      <Box direction='row' align='center' gap='xsmall'>
        {props.icon && React.createElement(props.icon, {size: '12px'})}
        <Text size='small'>{props.text}</Text>
      </Box>
    </MenuItem>
  )
}

const _logout = () => {
  localStorage.removeItem(AUTH_TOKEN)
  window.location.href = "/login"
}

function PlanDetails() {
  return null
}

function MeDropdown({me}) {
  const isAdmin = me.roles && me.roles.admin

  return (
    <Box width="225px">
      <Box pad='small' direction="row" align="center">
        <Avatar user={me} rightMargin='10px' />
        <Text size="small" weight='bold'>{me.name}</Text>
      </Box>
      <InterchangeableBox>
      {setAlternate => (
        <>
        <Box pad={{bottom: 'xxsmall'}}>
          <Modal target={<DropdownItem icon={User} text='update profile' />}>
          {setOpen => (
            <Box>
              <ModalHeader text='Update Profile' setOpen={setOpen} />
              <Box gap='small' pad="medium" style={{minWidth: '400px'}}>
                <UpdateProfile callback={() => setOpen(false)} me={me} />
              </Box>
            </Box>
          )}
          </Modal>
          <Modal target={<DropdownItem icon={Lock} text='change password' />}>
            {setOpen => (
              <Box width='400px'>
                <ModalHeader text='Update Password' setOpen={setOpen} />
                <Box gap='small' pad="medium">
                  <UpdatePassword callback={() => setOpen(false)} me={me} />
                </Box>
              </Box>
            )}
          </Modal>
          <Modal target={<DropdownItem icon={Iteration} text='theme selector' />}>
            {setOpen => (<Themes setOpen={setOpen} />)}
          </Modal>
          <SubMenu text='developer tools' setAlternate={setAlternate}>
            <Tools />
          </SubMenu>
          {isAdmin && (
            <SubMenu text='admin tools' setAlternate={setAlternate}>
              <AdminTools me={me} />
            </SubMenu>
          )}
          {isAdmin && (<PlanDetails />)}
        </Box>
        <Box border='top' pad={{vertical: 'xxsmall'}}>
          <MenuItem onClick={_logout}>
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

export default function Me(props) {
  const [mutation] = useMutation(UPDATE_USER, {
    update: (cache, { data: { updateUser } }) => {
      const {me} = cache.readQuery({ query: ME_Q });
      cache.writeQuery({query: ME_Q, data: {me: {...me, ...updateUser}}});
    }
  })
  const me = useContext(CurrentUserContext)

  return (
    <ThemeContext.Extend value={{layer: {zIndex: 25}}}>
      <HoveredBackground>
        <Box
          sidebarHover
          accentText
          style={{cursor: 'pointer'}}
          pad={{...props.pad, top: 'small', bottom: '7px'}}
          align='center'
          direction='row'>
          <Box direction='row' align='center' margin={{bottom: '5px'}}>
            <FilePicker
              extensions={['jpg', 'jpeg', 'png']}
              dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
              onChange={ (file) => mutation({variables: {id: me.id, attributes: {avatar: file}}})}
            >
              <span><Avatar user={me} rightMargin='10px' /></span>
            </FilePicker>
            <CloseableDropdown target={<MeHeader me={me} />}>
            {() => (<MeDropdown me={me} />)}
            </CloseableDropdown>
          </Box>
        </Box>
      </HoveredBackground>
    </ThemeContext.Extend>
  )
}