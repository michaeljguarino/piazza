import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import {Box, Form, Keyboard, FormField, Text, Anchor} from 'grommet'
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

class Login extends Component {
  state = {
    login: true, // switch between Login and SignUp
    email: '',
    password: '',
    name: '',
    handle: ''
  }

  _confirm = async (data) => {
    const { jwt } = this.state.login ? data.login : data.signup
    this._saveUserData(jwt)
    this.props.history.push(`/`)
  }

  _saveUserData = token => {
    localStorage.setItem(AUTH_TOKEN, token)
  }

  _checkLoggedIn = () => {
    if (localStorage.getItem(AUTH_TOKEN)) {
      this.props.history.push('/')
    }
  }

  render() {
    const { login, email, password, name, handle } = this.state
    const inviteToken = this.props.match.params.inviteToken
    this._checkLoggedIn()
    return (
      <Box background='brand' direction="column" align="center" justify="center" height="100vh">
        <Mutation
          mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
          variables={{ email, password, name, handle, inviteToken }}
          onCompleted={data => this._confirm(data)}
        >
          { (mutation, {loading, error}) => {
            return (
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
                        onChange={e => this.setState({ name: e.target.value })}
                        placeholder="your name"
                      />)}
                    {!login && (
                      <FormField
                        value={handle}
                        name="handle"
                        label="Handle"
                        onChange={e => this.setState({handle: e.target.value})}
                        placeholder="your handle"
                      />)}
                    <FormField
                      value={email}
                      name="email"
                      label="Email"
                      onChange={e => this.setState({ email: e.target.value })}
                      placeholder="Your email address"
                    />
                    <FormField
                      value={password}
                      name="password"
                      label="Password (at least 10 chars)"
                      type="password"
                      onChange={e => this.setState({ password: e.target.value })}
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
                    <Anchor margin={{left: '10px'}} size="small" fontWeight="400" onClick={() => this.setState({login: !login})}>
                      {login ? 'need to create an account?' : 'already have an account?'}
                    </Anchor>
                  </Box>
                </Form>
              </Keyboard>
            </Box>)
          }}
        </Mutation>
      </Box>
    )
  }
}

export default Login