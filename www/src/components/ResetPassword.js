import React, { useState } from 'react'
import gql from 'graphql-tag'
import { FormField, Box, Text, Form } from 'grommet'
import Button from './utils/Button'
import { useMutation } from 'react-apollo'
import Pill from './utils/Pill'
import { Close } from 'grommet-icons'

const RESET_EMAIL = gql`
  mutation ResetEmail($email: String!) {
    createResetToken(email: $email, type: PASSWORD) {
      id
    }
  }
`;

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
        {display && (
          <Pill background='status-ok' onClose={() => setDisplay(false)}>
            <Text>reset password email sent</Text>
            <Close style={{cursor: 'pointer'}} size='small' onClick={() => setDisplay(false)} />
          </Pill>
        )}
      </Box>
    </Box>
  )
}