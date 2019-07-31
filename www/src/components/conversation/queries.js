import gql from 'graphql-tag'

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($attributes: ConversationAttributes!) {
    createConversation(attributes: $attributes) {
      id
      name
      topic
    }
  }
`


export const UPDATE_CONVERSATION = gql`
  mutation UpdateConversation($id: ID!, $attributes: ConversationAttributes!) {
    updateConversation(id: $id, attributes: $attributes) {
      id
      name
      topic
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
        }
      }
    }
  }
`

export const PARTICIPANTS_Q = gql`
  query ConversationQuery($conversationId: ID!, $cursor: String) {
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