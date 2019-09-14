import React, {useState} from 'react'
import {Box} from 'grommet'
import {Mutation} from 'react-apollo'
import {UPDATE_USER} from './queries'
import Errors, {Error} from '../utils/Error'
import InputField from '../utils/InputField'
import Button, {SecondaryButton} from '../utils/Button'

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
        <Box gap='xsmall'>
          {unconfirmed && <Error error="Passwords do not match" />}
          {error && <Errors errors={error} />}
          <InputField
            label='Password'
            labelWidth='80px'
            type='password'
            value={password}
            placeholder='battery horse fire stapler'
            onChange={(e) => setPassword(e.target.value)} />
          <InputField
            label='Confirm'
            labelWidth='80px'
            type='password'
            value={confirm}
            placeholder='battery horse fire stapler'
            onChange={(e) => setConfirm(e.target.value)} />
          <Box margin={{top: 'xsmall'}} direction='row' align='center' justify='end' gap='xsmall'>
            <SecondaryButton label='Cancel' onClick={props.callback} round='xsmall' />
            <Button label='Change' round='xsmall' onClick={wrapped} />
          </Box>
        </Box>
      )
    }}
    </Mutation>
  )
}

export default UpdatePassword