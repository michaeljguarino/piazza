import React, { useState } from 'react'
import { Box, Text } from 'grommet'
import { useMutation } from 'react-apollo'
import { UPDATE_USER } from './queries'
import { Errors, Button, InputField } from 'forge-core'
import { StatusCritical, Checkmark } from 'grommet-icons'

function disableState(password, confirm) {
  if (password.length === 0) return {disabled: true, reason: 'enter a password'}
  if (password !== confirm) return {disabled: true, reason: 'passwords do not match'}
  return {disabled: false, reason: 'passwords match!'}
}

export default function UpdatePassword({me}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mutation, {loading, error}] = useMutation(UPDATE_USER, {
    variables: {id: me.id, attributes: {password}}
  })

  const {disabled, reason} = disableState(password, confirm)

  return (
    <Box gap='xsmall'>
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
        <Box direction='row' fill='horizontal' align='center' gap='xsmall'>
          {disabled ? <StatusCritical color='notif' size='12px' /> : <Checkmark color='status-ok' size='12px' />}
          <Text size='small' color={disabled ? 'notif' : 'status-ok'}>{reason}</Text>
        </Box>
        <Button loading={loading} label='Change' round='xsmall' onClick={mutation} />
      </Box>
    </Box>
  )
}