import React from 'react'
import { Anchor, Text } from 'grommet'
import { Flyout } from 'forge-core'
import UserDetail from './UserDetail'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'

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
      {includePresence && (
        <WithPresence id={user.id}>
        {present => <PresenceIndicator present={present} />}
        </WithPresence>
      )}
    </WithFlyout>
  )
}