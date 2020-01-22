import React from 'react'
import {Anchor, Text} from 'grommet'
import UserDetail from './UserDetail'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'
import Flyout from '../utils/Flyout'

function WithFlyout(props) {
  if (props.noFlyout) return props.children

  return (
    <Flyout target={props.children}>
    {setOpen => (
      <UserDetail user={props.user} setOpen={setOpen} onChat={props.onChat} />
    )}
    </Flyout>
  )
}

export default function UserHandle({user, color, weight, size, margin, includePresence, ...props}) {
  const {id, handle} = user

  return (
    <WithFlyout user={user} {...props}>
      <Anchor>
        <Text size={size || 'small'} weight={weight} color={color || 'black'} margin={margin || {right: '5px'}}>@{handle}</Text>
        {includePresence && (
          <WithPresence id={id} >
            {present => <PresenceIndicator present={present} />}
          </WithPresence>
        )}
      </Anchor>
    </WithFlyout>
  )
}