import React, { useState } from 'react'
import { AUTH_TOKEN } from '../constants'
import { useMutation } from 'react-apollo'
import gql from 'graphql-tag'
import { Box, Form, Keyboard, FormField, Text, Anchor } from 'grommet'
import Error from './utils/Error'
import Button from './utils/Button'

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
  return (
    <Box background='brand' direction="column" align="center" justify="center" height="100vh">
      <Box width="400px" background="light-1" pad='medium' border={{style: "hidden"}} round="small" elevation="small">
        {error && <Error errors={error} />}
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
            <Box margin={{bottom: '10px'}}>
              <Box direction="column" justify="center" align="center">
                <Text size="medium" weight="bold">{login ? 'Login' : 'Sign Up'}</Text>
              </Box>
              {!login && (
                <FormField
                  value={name}
                  label="name"
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
                onChange={e => setState({...state, email: e.target.value })}
                placeholder="Your email address"
              />
              <FormField
                value={password}
                name="password"
                label="Password (at least 10 chars)"
                type="password"
                onChange={e => setState({...state, password: e.target.value })}
                placeholder="battery horse fire stapler"
              />
            </Box>
            <Box direction="row" align="center">
              <Button
                onClick={mutation}
                loading={loading}
                size='small'
                round='xsmall'
                pad={{vertical: 'xsmall', horizontal: 'medium'}}
                label={login ? 'login' : 'sign up'} />
              <Anchor
                margin={{left: '10px'}}
                size="small"
                fontWeight="400"
                onClick={() => setState({...state, login: !login})}>
                {login ? 'need to create an account?' : 'already have an account?'}
              </Anchor>
            </Box>
          </Form>
        </Keyboard>
      </Box>
    </Box>
  )
}

export default Login