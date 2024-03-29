import React, { useState } from 'react'
import { AUTH_TOKEN } from '../constants'
import { useMutation } from 'react-apollo'
import { Errors, Button } from 'forge-core'
import gql from 'graphql-tag'
import { Box, Form, Keyboard, FormField, Text, Anchor } from 'grommet'

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

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!, $inviteToken: String) {
    login(email: $email, password: $password, inviteToken: $inviteToken) {
      jwt
    }
  }
`;

function Login(props) {
  const [state, setState] = useState({
    login: true, // switch between Login and SignUp
    email: '',
    password: '',
    name: '',
    handle: ''
  })
  const {email, login, name, password, handle} = state
  const inviteToken = props.match.params.inviteToken

  const [mutation, {loading, error}] = useMutation(login ? LOGIN_MUTATION : SIGNUP_MUTATION, {
    variables: { email, password, name, handle, inviteToken },
    onCompleted: data => {
      const { jwt } = state.login ? data.login : data.signup
      localStorage.setItem(AUTH_TOKEN, jwt)
      window.location = '/'
    }
  })

  if (localStorage.getItem(AUTH_TOKEN)) {
    props.history.push('/')
  }
  const disabled = [email, password].some((v) => v.length === 0)

  return (
    <Box direction="column" align="center" justify="center" height="100vh" background='brand'>
      <Box width="60%" pad='medium' round='xsmall' background='white' gap='10px'>
        {error && <Errors errors={error} />}
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
            <Box>
              <Box direction="column" justify="center" align="center">
                <Text size="medium" weight="bold">{login ? 'Login' : 'Sign Up'}</Text>
              </Box>
              {!login && (
                <FormField
                  value={name}
                  label="Name"
                  name="Name"
                  onChange={e => setState({...state, name: e.target.value })}
                  placeholder="your name"
                />)}
              {!login && (
                <FormField
                  value={handle}
                  name="handle"
                  label="Handle"
                  onChange={e => setState({...state, handle: e.target.value})}
                  placeholder="your handle"
                />)}
              <FormField
                value={email}
                name="email"
                label="Email"
                placeholder="Your email address"
                onChange={e => setState({...state, email: e.target.value })}
              />
              <FormField
                value={password}
                name="password"
                label="Password (at least 10 chars)"
                type="password"
                placeholder="battery horse fire stapler"
                onChange={e => setState({...state, password: e.target.value })}
              />
            </Box>
            <Box direction="row" align="center" justify='end' margin={{top: 'small'}} align='center' gap='small'>
              <Box direction='row' align='center' justify='end'>
                <Anchor size='small' color='dark-3' onClick={() => props.history.push('/reset-password')}>
                  forgot your password?
                </Anchor>
              </Box>
              <Button
                onClick={mutation}
                loading={loading}
                disabled={disabled}
                size='small'
                round='xsmall'
                pad={{vertical: 'xsmall', horizontal: 'medium'}}
                label={login ? 'login' : 'sign up'} />
            </Box>
          </Form>
        </Keyboard>
      </Box>
    </Box>
  )
}

export default Login