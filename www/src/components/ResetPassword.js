import React, { useState } from 'react'
import gql from 'graphql-tag'
import { FormField, Box, Text, Form } from 'grommet'
import Button from './utils/Button'
import { useMutation } from 'react-apollo'
import Pill from './utils/Pill'
import { Close } from 'grommet-icons'
import { Error } from './utils/Error'

const RESET_EMAIL = gql`
  mutation ResetEmail($email: String!) {
    createResetToken(email: $email, type: PASSWORD) {
      id
    }
  }
`;

const APPLY_TOKEN = gql`
  mutation Token($id: String!, $password: String!) {
    applyResetToken(id: $id, args: {password: $password}) {
      jwt
    }
  }
`;

function Header({text}) {
  return (
    <Box direction='row' align='center' justify='center' fill='horizontal'>
      <Text weight='bold'>{text}</Text>
    </Box>
  )
}

export function ChangePassword({history, match: {params: {token}}}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mutation, {loading, error}] = useMutation(APPLY_TOKEN, {
    variables: {password, id: token},
    onCompleted: () =>  history.push('/')
  })

  return (
    <Box height='100vh' width='100vw' align='center' justify='center'>
      <Box width='60%' elevation='small' gap='small' pad='medium'>
        <Header text='Change your password' />
        {error && <Error errors={error} />}
        <Form onSubmit={mutation}>
          <FormField
            value={password}
            onChange={({target: {value}}) => setPassword(value)}
            placeholder='a long password'
            name='password'
            type='password'
            label='Password' />
          <FormField
            value={confirm}
            onChange={({target: {value}}) => setConfirm(value)}
            placeholder='confirm your password'
            name='confirm'
            type='password'
            label='Confirm Password' />
          <Box fill='horizontal' direction='row' justify='end'>
            <Button
              loading={loading}
              disabled={password !== confirm || password.length <= 8}
              round='xsmall'
              label='Update password'
              onClick={mutation} />
          </Box>
        </Form>
      </Box>
    </Box>
  )
}

export function ResetPassword() {
  const [email, setEmail] = useState('')
  const [display, setDisplay] = useState(false)
  const [mutation, {loading}] = useMutation(RESET_EMAIL, {
    variables: {email},
    onCompleted: () => setDisplay(true)
  })

  return (
    <Box height='100vh' width='100vw' align='center' justify='center'>
      <Box width='60%' elevation='small' gap='small' pad='medium'>
        <Header text='Reset Your Password' />
        <Form onSubmit={mutation}>
          <FormField
            value={email}
            onChange={({target: {value}}) => setEmail(value)}
            placeholder='your email'
            name='email'
            label='Email' />
          <Box fill='horizontal' direction='row' justify='end'>
            <Button loading={loading} round='xsmall' label='Send reset email' onClick={mutation} />
          </Box>
        </Form>
      </Box>
      {display && (
          <Pill background='status-ok' onClose={() => setDisplay(false)}>
            <Box direction='row' align='center' gap='xsmall'>
              <Text>reset password email sent</Text>
              <Close style={{cursor: 'pointer'}} size='small' onClick={() => setDisplay(false)} />
            </Box>
          </Pill>
        )}
    </Box>
  )
}