import React, { useState } from 'react'
import { Box } from 'grommet'
import { useMutation } from 'react-apollo'
import { UPDATE_USER } from './queries'
import Errors, { Error } from '../utils/Error'
import InputField from '../utils/InputField'
import Button, { SecondaryButton } from '../utils/Button'

export default function UpdatePassword({me, callback}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [unconfirmed, setUnconfirmed] = useState(false)
  const [mutation, {loading, error}] = useMutation(UPDATE_USER, {
    variables: {id: me.id, attributes: {password: password}}
  })
  const wrapped = () => {
    if (password !== confirm) {
      setUnconfirmed(true)
      return
    }

    callback && callback()
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
        onChange={({target: {value}}) => setPassword(value)} />
      <InputField
        label='Confirm'
        labelWidth='80px'
        type='password'
        value={confirm}
        placeholder='battery horse fire stapler'
        onChange={({target: {value}}) => setConfirm(value)} />
      <Box margin={{top: 'xsmall'}} direction='row' align='center' justify='end' gap='xsmall'>
        <SecondaryButton label='Cancel' onClick={callback} round='xsmall' />
        <Button loading={loading} label='Change' round='xsmall' onClick={wrapped} />
      </Box>
    </Box>
  )
}