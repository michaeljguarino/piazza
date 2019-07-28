import gql from 'graphql-tag'

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($name: String!) {
    createConversation(attributes: {name: $name}) {
      id
      name
    }
  }
`

export const CONVERSATIONS_Q = gql`
  query Conversations($cursor: String) {
    conversations(public: true, first: 20, after: $cursor) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`

export const PARTICIPANTS_Q = gql`
  query ConversationQuery($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
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