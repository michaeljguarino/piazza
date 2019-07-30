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

const GQL_URL='http://chat.piazzaapp.com/gql'
const WS_URI='ws://chat.piazzaapp.com/socket'

const httpLink = createLink({
  uri: GQL_URL
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  let authHeaders = token ? {authorization: `Bearer ${token}`} : {}
  return {
    headers: Object.assign(headers || {}, authHeaders)
  }
})

const absintheSocket = AbsintheSocket.create(
  new PhoenixSocket(WS_URI, {
    params: () => {
      let token = localStorage.getItem(AUTH_TOKEN)
      if (token) {
        return { Authorization: `Bearer ${token}` };
      } else {
        return {};
      }
    },
  }),
);

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

export { client }