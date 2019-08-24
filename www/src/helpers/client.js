import { ApolloClient } from 'apollo-client'
import { setContext } from 'apollo-link-context'
import { createLink } from "apollo-absinthe-upload-link";
import { InMemoryCache } from 'apollo-cache-inmemory'
import { AUTH_TOKEN } from '../constants'
import { split } from 'apollo-link'
import {hasSubscription} from "@jumpn/utils-graphql";
import {createAbsintheSocketLink} from "@absinthe/socket-apollo-link";
import * as AbsintheSocket from "@absinthe/socket";
import {Socket as PhoenixSocket} from "phoenix";
import customFetch from './uploadLink'
import {apiHost} from './hostname'

const API_HOST = apiHost()
const GQL_URL=`http://${API_HOST}/gql`
const WS_URI=`ws://${API_HOST}/socket`

const httpLink = createLink({
  uri: GQL_URL,
  fetch: customFetch
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  let authHeaders = token ? {authorization: `Bearer ${token}`} : {}
  return {
    headers: Object.assign(headers || {}, authHeaders)
  }
})

const socket = new PhoenixSocket(WS_URI, {
  params: () => {
    let token = localStorage.getItem(AUTH_TOKEN)
    if (token) {
      return { Authorization: `Bearer ${token}` };
    } else {
      return {};
    }
  },
});


const absintheSocket = AbsintheSocket.create(socket);

const socketLink = createAbsintheSocketLink(absintheSocket);

const splitLink = split(
  (operation) => hasSubscription(operation.query),
  socketLink,
  httpLink,
);

const client = new ApolloClient({
  link: authLink.concat(splitLink),
  cache: new InMemoryCache()
})

export { client, socket }