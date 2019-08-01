import React from 'react'
import {Anchor, Text} from 'grommet'
import {Robot} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import UserDetail from './UserDetail'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'

function UserHandle(props) {
  return (
    <Dropdown align={{left: 'right'}}>
      <Anchor>
        <Text size={props.size || 'small'} weight={props.weight} color={props.color} margin={props.margin || {right: '5px'}}>@{props.user.handle}</Text>
        {(props.user.bot) ? <Robot color={props.color} size='small' /> : ''}
        {props.includePresence && (
          <WithPresence id={props.user.id} >
            {present => <PresenceIndicator present={present} />}
          </WithPresence>
        )}
      </Anchor>
      <UserDetail user={props.user} />
    </Dropdown>
  )
}

export default UserHandle