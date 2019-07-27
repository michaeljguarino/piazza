import { client } from './client'
import gql from 'graphql-tag'
import {AUTH_TOKEN} from '../constants'

const ME_Q = gql`
  query {
    me {
      id
    }
  }
`

async function validateLogin() {
  return client.query({
    query: ME_Q
  }).then(res => {
    return res.data && res.data.me && res.data.me.id
  })
}

function wipeToken() {
  localStorage.removeItem(AUTH_TOKEN)
}

export { validateLogin, wipeToken }