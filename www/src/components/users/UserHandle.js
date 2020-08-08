import React from 'react'
import { Text } from 'grommet'
import { Flyout } from 'forge-core'
import UserDetail from './UserDetail'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'
import { Status } from './UserStatus'

function WithFlyout({noFlyout, children, onChat, user}) {
  if (noFlyout) return children

  return (
    <Flyout target={children}>
    {setOpen => (<UserDetail user={user} setOpen={setOpen} onChat={onChat} />)}
    </Flyout>
  )
}

export default function UserHandle({user, color, weight, size, margin, includePresence, ...props}) {
  return (
    <WithFlyout user={user} {...props}>
      <Text
        style={{cursor: 'pointer'}}
        size={size || 'small'}
        weight={weight || 500}
        margin={margin || {right: '5px'}}>
        @{user.handle}
      </Text>
      {user.status && <Status user={user} size={18} />}
      {includePresence && !user.status && (
        <WithPresence id={user.id}>
        {present => <PresenceIndicator present={present} />}
        </WithPresence>
      )}
    </WithFlyout>
  )
}