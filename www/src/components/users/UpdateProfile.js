import React, {useState} from 'react'
import {Form, Box, TextArea, Button} from 'grommet'
import {Mutation} from 'react-apollo'
import {UPDATE_USER} from './queries'

function UpdateProfile(props) {
  const [bio, setBio] = useState(props.me.bio)
  return (
    <Mutation mutation={UPDATE_USER} variables={{id: props.me.id, attributes: {bio: bio}}}>
    {mutation => (
      <Form onSubmit={() => {
        props.callback && props.callback()
        mutation()
      }}>
        <Box gap='small'>
          <TextArea
            value={bio}
            placeholder="A little bit about me"
            onChange={e => setBio(e.target.value)}
          />
          <Button type='submit' primary label='Save' />
        </Box>
      </Form>
    )}
    </Mutation>
  )
}

export default UpdateProfile