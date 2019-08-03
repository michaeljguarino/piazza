import gql from 'graphql-tag'

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($attributes: ConversationAttributes!) {
    createConversation(attributes: $attributes) {
      id
      name
      topic
      unreadMessages
    }
  }
`


export const UPDATE_CONVERSATION = gql`
  mutation UpdateConversation($id: ID!, $attributes: ConversationAttributes!) {
    updateConversation(id: $id, attributes: $attributes) {
      id
      name
      topic
      unreadMessages
    }
  }
`;

export const CONVERSATIONS_Q = gql`
  query Conversations($cursor: String) {
    conversations(public: true, first: 20, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
          topic
          unreadMessages
        }
      }
    }
  }
`

export const PARTICIPANTS_Q = gql`
  query ParticipantQ($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      name
      topic
      participants(first: 25, after: $cursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id
            user {
              name
              handle
              backgroundColor
            }
          }
        }
      }
    }
  }
`

export const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($id: ID!) {
    deleteConversation(id: $id) {
      id
    }
  }
`;

export const NEW_PARTICIPANTS_SUB = gql`
  subscription NewParticipants($conversationId: ID!) {
    newParticipants(conversationId: $conversationId) {
      id
      user {
        name
        handle
        backgroundColor
      }
    }
  }
`;

export const DELETED_PARTICIPANTS_SUB = gql`
  subscription NewParticipants($conversationId: ID!) {
    deletedParticipants(conversationId: $conversationId) {
      id
      user {
        name
        handle
        backgroundColor
      }
    }
  }
`;