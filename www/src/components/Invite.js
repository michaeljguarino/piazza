import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useMutation, useQuery } from 'react-apollo'
import { useParams } from 'react-router-dom'
import { Box, Keyboard, Text } from 'grommet'
import { Error, Button, SecondaryButton, InputCollection, ResponsiveInput, Loading } from 'forge-core'
import { AUTH_TOKEN } from '../constants'
import { AvatarContainer } from './users/Avatar'
import { StatusCritical, Checkmark } from 'grommet-icons'

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

const INVITE_Q = gql`
  query Invite($id: ID!) {
    invite(id: $id) {
      id
      creator {
        name
      }
    }
  }
`;

function disableState(password, confirm) {
  if (password.length === 0) return {disabled: true, reason: 'enter a password'}
  if (password.length < 10) return {disabled: true, reason: 'password is too short'}
  if (password !== confirm) return {disabled: true, reason: 'passwords do not match'}
  return {disabled: false, reason: 'passwords match!'}
}

function Container({children}) {
  return (
    <Box width='100vw' height='100vh'  align="center" justify='center' background='brand'>
      <Box width='60%' pad='medium' round='xsmall' background='white'>
        {children}
      </Box>
    </Box>
  )
}

function EmptyInvite() {
  return (
    <Container>
      <Box fill align='center' justify='center'>
        <Text>Invite is no longer valid</Text>
      </Box>
    </Container>
  )
}

function LoadingInvite() {
  return (
    <Container>
      <Loading />
    </Container>
  )
}


export default function Invite() {
  const [state, setState] = useState({name: '', email: '', password: '', confirm: '', handle: '', editPassword: false})
  const {name, email, handle, password, confirm, editPassword} = state
  const {inviteToken} = useParams()
  const [mutation, {loading, error}] = useMutation(SIGNUP_MUTATION, {
    variables: { email, password, name, handle, inviteToken },
    onCompleted: (data) => {
      localStorage.setItem(AUTH_TOKEN, data.signup.jwt)
      window.location = '/'
    }
  })
  const {disabled, reason} = disableState(password, confirm)
  const filled = [name, email, handle].every((f) => f.length > 0)
  const {data, error: fetchError} = useQuery(INVITE_Q, {variables: {id: inviteToken}})

  if (fetchError || (data && !data.invite)) return (<EmptyInvite />)
  if (!data) return (<LoadingInvite />)

  const {creator} = data.invite

  return (
    <Container>
      {error && <Error errors={error} />}
      <Keyboard onEnter={editPassword && !disabled ? mutation : null}>
        <Box>
          <Box margin={{bottom: '10px'}}>
            <Box direction="column" justify="center" align="center">
              <Text size="medium" weight="bold">Accept {creator.name}'s invite</Text>
            </Box>
            <Box pad='small' direction='row' align='center' margin={{bottom: 'small'}}>
              <AvatarContainer background='#6b5b95' text={name} />
              <Box>
                <Text size='small' weight={500}>{name} {handle.length > 0 ? `(${handle})` : ''}</Text>
                <Text size='small' color='dark-3'>{email}</Text>
              </Box>
            </Box>
            {!editPassword ? (
              <Box animation={{type: 'fadeIn', duration: 500}}>
                <InputCollection>
                  <ResponsiveInput
                    label='name'
                    placeholder='John Doe'
                    value={name}
                    onChange={({target: {value}}) => setState({...state, name: value})} />
                  <ResponsiveInput
                    label='handle'
                    value={handle}
                    placeholder='your-handle'
                    onChange={({target: {value}}) => setState({...state, handle: value})} />
                  <ResponsiveInput
                    label='email'
                    placeholder='someone@example.com'
                    value={email}
                    onChange={({target: {value}}) => setState({...state, email: value})} />
                </InputCollection>
              </Box>
            ) : (
              <Box animation={{type: 'fadeIn', duration: 500}}>
                <InputCollection>
                  <ResponsiveInput
                    label='password (greater than 10 chars)'
                    placeholder='battery horse fire stapler'
                    type='password'
                    value={password}
                    onChange={({target: {value}}) => setState({...state, password: value})} />
                  <ResponsiveInput
                    label='confirm'
                    type='password'
                    value={confirm}
                    onChange={({target: {value}}) => setState({...state, confirm: value})} />
                </InputCollection>
              </Box>
            )}
          </Box>
          <Box direction="row" align="center" justify='end'>
            {editPassword && (<Box direction='row' fill='horizontal' align='center' gap='xsmall'>
              {disabled ? <StatusCritical color='notif' size='12px' /> : <Checkmark color='status-ok' size='12px' />}
              <Text size='small' color={disabled ? 'notif' : 'status-ok'}>{reason}</Text>
            </Box>)}
            <Box flex={false} direction='row' gap='xsmall' justify='end'>
              {editPassword && (<SecondaryButton
                label='Go Back'
                onClick={() => setState({...state, editPassword: false})} />)}
              <Button
                onClick={editPassword ? mutation : () => setState({...state, editPassword: true})}
                loading={loading}
                disabled={editPassword ? disabled : !filled}
                size='small'
                round='xsmall'
                pad={{vertical: 'xsmall', horizontal: 'medium'}}
                label={editPassword ? 'sign up' : 'continue'} />
            </Box>
          </Box>
        </Box>
      </Keyboard>
    </Container>
  )
}