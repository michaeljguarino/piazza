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

function UserHandle(props) {
  return (
    <WithFlyout {...props}>
      <Anchor>
        <Text size={props.size || 'small'} weight={props.weight} color={props.color} margin={props.margin || {right: '5px'}}>@{props.user.handle}</Text>
        {props.includePresence && (
          <WithPresence id={props.user.id} >
            {present => <PresenceIndicator present={present} />}
          </WithPresence>
        )}
      </Anchor>
    </WithFlyout>
  )
}

export default UserHandle