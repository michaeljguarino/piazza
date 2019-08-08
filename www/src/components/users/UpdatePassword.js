import React, {useState} from 'react'
import {Form, FormField, Button} from 'grommet'
import {Mutation} from 'react-apollo'
import {UPDATE_USER} from './queries'
import Errors, {Error} from '../utils/Error'

function UpdatePassword(props) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [unconfirmed, setUnconfirmed] = useState(false)

  return (
    <Mutation mutation={UPDATE_USER} variables={{id: props.me.id, attributes: {password: password}}}>
    {(mutation, {error}) => {
      const wrapped = () => {
        if (password !== confirm) {
          setUnconfirmed(true)
          return
        }

        props.callback && props.callback()
        mutation()
      }
      return (
        <Form onSubmit={wrapped}>
          {unconfirmed && <Error error="Passwords do not match" />}
          {error && <Errors errors={error} />}
          <FormField
            value={password}
            type='password'
            label="Password"
            name="password"
            onChange={e => setPassword(e.target.value)}
            placeholder="battery horse fire stapler"
          />
          <FormField
            value={confirm}
            type='password'
            label="Confirm Password"
            name="confirm_password"
            onChange={e => setConfirm(e.target.value)}
            placeholder="battery horse fire stapler"
          />
          <Button type='submit' primary label='Change' />
        </Form>
      )
    }}
    </Mutation>
  )
}

export default UpdatePassword