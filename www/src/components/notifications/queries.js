import gql from 'graphql-tag'

export const NOTIFICATIONS_Q=gql`
  query Notifications($cursor: String) {
    notifications(first: 20, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          type
          actor {
            id
            name
            handle
            email
            backgroundColor
            avatar
            bot
          }
          message {
            id
            text
            conversation {
              id
              name
              topic
            }
          }
        }
      }
    }
  }
`;