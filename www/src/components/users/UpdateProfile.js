import React, {useState} from 'react'
import {Keyboard, Box, TextArea} from 'grommet'
import {Mutation} from 'react-apollo'
import Button, {SecondaryButton} from '../utils/Button'
import InputField from '../utils/InputField'
import {UPDATE_USER} from './queries'

function getUserFields(attrs) {
  const {bio, title, phone} = attrs
  return {bio, title, phone}
}

function UpdateProfile(props) {
  const [userFields, setUserFields] = useState(getUserFields(props.me))
  return (
    <Mutation mutation={UPDATE_USER} variables={{id: props.me.id, attributes: userFields}}>
    {mutation => {
      const submit = () => {
        props.callback && props.callback()
        mutation()
      }
      return (
        <Keyboard onEnter={submit}>
          <>
          <Box gap='xsmall'>
            <InputField 
              label='Title' 
              value={userFields.title} 
              onChange={e => setUserFields({...userFields, title: e.target.value})}
            />
            <InputField 
              label='Phone' 
              value={userFields.phone} 
              onChange={e => setUserFields({...userFields, phone: e.target.value})}
            />
          </Box>
          <Box gap='small' pad={{top: 'small'}}>
            <TextArea
              value={userFields.bio}
              placeholder="A little bit about me"
              onChange={e => setUserFields({...userFields, bio: e.target.value})}
            />
            <Box direction='row' align='center' justify='end' gap='xsmall'>
              <SecondaryButton round='xsmall' label='Cancel' onClick={props.callback} />
              <Button round='xsmall' label='Save' onClick={submit} />
            </Box>
          </Box>
          </>
        </Keyboard>
    )}}
    </Mutation>
  )
}

export default UpdateProfile