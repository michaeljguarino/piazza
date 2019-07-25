import { client } from './client'
import gql from 'graphql-tag'

const ME_Q = gql`
  query {
    me {
      id
    }
  }
`

const isLoggedIn = () => {
  return client.query({
    query: ME_Q
  }).then(response => response.data && response.data.id);
}

export { isLoggedIn }