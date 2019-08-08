import gql from 'graphql-tag'
import {MessageFragment} from '../models/conversations'
import {UserFragment} from '../models/users'

export const MESSAGES_Q = gql`
  query ConversationQuery($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      messages(first: 15, after: $cursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            ...MessageFragment
          }
        }
      }
    }
  }
  ${MessageFragment}
`
export const NEW_MESSAGES_SUB = gql`
  subscription MessageDeltas($conversationId: ID!) {
    messageDelta(conversationId: $conversationId) {
      delta
      payload {
        ...MessageFragment
      }
    }
  }
  ${MessageFragment}
`;

export const MESSAGE_MUTATION = gql`
  mutation CreateMessage($conversationId: ID!, $attributes: MessageAttributes!) {
    createMessage(conversationId: $conversationId, attributes: $attributes) {
      ...MessageFragment
    }
  }
  ${MessageFragment}
`

export const SEARCH_USERS=gql`
  query SearchUsers($name: ID!) {
    searchUsers(name: $name, first: 10) {
      edges {
        node {
          ...UserFragment
        }
      }
    }
  }
  ${UserFragment}
`;