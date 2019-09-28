import gql from 'graphql-tag'
import {UserFragment} from '../models/users'

export const UPDATE_USER=gql`
  mutation UpdateUser($id: ID!, $attributes: UserAttributes!) {
    updateUser(id: $id, attributes: $attributes) {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const ME_Q=gql`
  query {
    me {
      ...UserFragment
      notificationPreferences {
        mention
        message
        participant
      }
      unseenNotifications
    }
  }
  ${UserFragment}
`

export const USERS_Q = gql`
  query Users($cursor: String) {
    users(first: 15, after: $cursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...UserFragment
        }
      }
    }
  }
  ${UserFragment}
`;

export const USER_SUB = gql`
  subscription {
    userDelta {
      delta
      payload {
        ...UserFragment
      }
    }
  }
  ${UserFragment}
`;