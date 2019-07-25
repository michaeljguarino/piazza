import { client } from './client'
import gql from 'graphql-tag'

const ME_Q = gql`
  query {
    me {
      id
    }
  }
`

async function isLoggedIn() {
  let result = await client.query({
    query: ME_Q
  }).then(response => response.data && response.data.id).catch(_ => false);
  console.log(result);
  return result
}

export { isLoggedIn }