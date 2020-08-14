import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useMutation } from 'react-apollo'
import { useParams } from 'react-router-dom'
import { Box, Keyboard, Form, Text, FormField } from 'grommet'
import { Error, Button } from 'forge-core'
import { AUTH_TOKEN } from '../constants'

const SIGNUP_MUTATION = gql`
  mutation Signup(
    $email: String!,
    $password: String!,
    $handle: String!,
    $name: String!,
    $inviteToken: String
  ) {
    signup(
      attributes: {email: $email, password: $password, handle: $handle, name: $name},
      inviteToken: $inviteToken
    ) {
      jwt
    }
  }
`;


export default function Invite() {
  const [state, setState] = useState({name: '', email: '', password: '', handle: ''})
  const {name, email, handle, password} = state
  const {inviteToken} = useParams()
  const [mutation, {loading, error}] = useMutation(SIGNUP_MUTATION, {
    variables: { email, password, name, handle, inviteToken },
    onCompleted: (data) => {
      console.log(data)
      localStorage.setItem(AUTH_TOKEN, data.signup.jwt)
      window.location = '/'
    }
  })
  return (
    <Box direction="column" align="center" justify="center" height="100vh" background='brand'>
      <Box width="60%" pad='medium' round='xsmall' background='white'>
        {error && <Error errors={error} />}
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
            <Box margin={{bottom: '10px'}}>
              <Box direction="column" justify="center" align="center">
                <Text size="medium" weight="bold">Sign Up</Text>
              </Box>
              <FormField
                value={name}
                label="name"
                name="Name"
                onChange={({target: {value}}) => setState({...state, name: value })}
                placeholder="your name"
              />
              <FormField
                value={handle}
                name="handle"
                label="Handle"
                onChange={({target: {value}}) => setState({...state, handle: value})}
                placeholder="your handle"
              />
              <FormField
                value={email}
                name="email"
                label="Email"
                placeholder="Your email address"
                onChange={({target: {value}}) => setState({...state, email: value })}
              />
              <FormField
                value={password}
                name="password"
                label="Password (at least 10 chars)"
                type="password"
                placeholder="battery horse fire stapler"
                onChange={({target: {value}}) => setState({...state, password: value })}
              />
            </Box>
            <Box direction="row" align="center">
              <Button
                onClick={mutation}
                loading={loading}
                size='small'
                round='xsmall'
                pad={{vertical: 'xsmall', horizontal: 'medium'}}
                label='sign up' />
            </Box>
          </Form>
        </Keyboard>
      </Box>
    </Box>
  )
}