import { ApolloClient } from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { AUTH_TOKEN } from '../constants'


const httpLink = createHttpLink({
  uri: 'http://api.piazzaapp.com/gql'
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  let authHeaders = token ? {authorization: `Bearer ${token}`} : {}
  return {
    headers: Object.assign(headers || {}, authHeaders)
  }
})


const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

export { client }