import React, {useState} from 'react'
import {Keyboard, Box, TextArea} from 'grommet'
import {Mutation} from 'react-apollo'
import Button, {SecondaryButton} from '../utils/Button'
import {UPDATE_USER} from './queries'

function UpdateProfile(props) {
  const [bio, setBio] = useState(props.me.bio)
  return (
    <Mutation mutation={UPDATE_USER} variables={{id: props.me.id, attributes: {bio: bio}}}>
    {mutation => {
      const submit = () => {
        props.callback && props.callback()
        mutation()
      }
      return (
        <Keyboard onEnter={submit}>
          <Box gap='small'>
            <TextArea
              value={bio}
              placeholder="A little bit about me"
              onChange={e => setBio(e.target.value)}
            />
            <Box direction='row' align='center' justify='end' gap='xsmall'>
              <SecondaryButton round='xsmall' label='Cancel' onClick={props.callback} />
              <Button round='xsmall' label='Save' onClick={submit} />
            </Box>
          </Box>
        </Keyboard>
    )}}
    </Mutation>
  )
}

export default UpdateProfile