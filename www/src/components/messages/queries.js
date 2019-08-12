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

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId) {
      id
    }
  }
`;

export const CREATE_REACTION = gql`
  mutation CreateReaction($messageId: ID!, $name: String!) {
    createReaction(messageId: $messageId, name: $name) {
      ...MessageFragment
    }
  }
  ${MessageFragment}
`;

export const DELETE_REACTION = gql`
  mutation DeleteReaction($messageId: ID!, $name: String!) {
    deleteReaction(messageId: $messageId, name: $name) {
      ...MessageFragment
    }
  }
  ${MessageFragment}
`;

export const SEARCH_USERS = gql`
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

export const PIN_MESSAGE = gql`
  mutation PinMessage($messageId: ID!, $pinned: Boolean!) {
    pinMessage(messageId: $messageId, pinned: $pinned) {
      ...MessageFragment
    }
  }
  ${MessageFragment}
`;

export const PINNED_MESSAGES = gql`
  query ConversationQuery($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      pinnedMessageCount
      pinnedMessages(first: 15, after: $cursor) {
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
`;