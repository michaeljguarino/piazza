import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $handle: String!, $name: String!) {
    signup(attributes: {email: $email, password: $password, handle: $handle, name: $name}) {
      jwt
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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

  render() {
    const { login, email, password, name, handle } = this.state
    return (
      <div>
        <h4 className="mv3">{login ? 'Login' : 'Sign Up'}</h4>
        <div className="flex flex-column">
          {!login && (
            <input
              value={name}
              onChange={e => this.setState({ name: e.target.value })}
              type="text"
              placeholder="your name"
            />)}
          {!login && (
            <input
              value={handle}
              onChange={e => this.setState({name: e.target.value})}
              type="text"
              placeholder="your handle"
            />
          )}
          <input
            value={email}
            onChange={e => this.setState({ email: e.target.value })}
            type="text"
            placeholder="Your email address"
          />
          <input
            value={password}
            onChange={e => this.setState({ password: e.target.value })}
            type="password"
            placeholder="battery horse fire stapler"
          />
        </div>
        <div className="flex mt3">
          <Mutation
              mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
              variables={{ email, password, name, handle }}
              onCompleted={data => this._confirm(data)}
            >
            {mutation => (
              <div className="pointer mr2 button" onClick={mutation}>
                {login ? 'login' : 'create account'}
              </div>
            )}
          </Mutation>
          <div
            className="pointer button"
            onClick={() => this.setState({ login: !login })}
          >
            {login
              ? 'need to create an account?'
              : 'already have an account?'}
          </div>
        </div>
      </div>
    )
  }

  _confirm = async (data) => {
    const { jwt } = this.state.login ? data.login : data.signup
    this._saveUserData(jwt)
    this.props.history.push(`/`)
  }

  _saveUserData = token => {
    localStorage.setItem(AUTH_TOKEN, token)
  }
}

export default Login