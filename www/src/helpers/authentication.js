import { client } from './client'
import gql from 'graphql-tag'

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

export { validateLogin }