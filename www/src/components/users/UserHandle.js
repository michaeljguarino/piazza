import React from 'react'
import {Anchor, Text} from 'grommet'
import Dropdown from '../utils/Dropdown'
import UserDetail from './UserDetail'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'

function UserHandle(props) {
  return (
    <Dropdown align={props.align || {left: 'right'}}>
      <Anchor>
        <Text size={props.size || 'small'} weight={props.weight} color={props.color} margin={props.margin || {right: '5px'}}>@{props.user.handle}</Text>
        {props.includePresence && (
          <WithPresence id={props.user.id} >
            {present => <PresenceIndicator present={present} />}
          </WithPresence>
        )}
      </Anchor>
      <UserDetail user={props.user} onChat={props.onChat} />
    </Dropdown>
  )
}

export default UserHandle