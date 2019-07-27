import gql from 'graphql-tag'

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($name: String!) {
    createConversation(attributes: {name: $name}) {
      id
      name
      insertedAt
      creator {
        name
      }
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