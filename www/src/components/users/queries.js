import gql from 'graphql-tag'
import { UserFragment, LicenseFragment } from '../models/users'

export const UPDATE_USER=gql`
  mutation UpdateUser($id: ID!, $attributes: UserAttributes!) {
    updateUser(id: $id, attributes: $attributes) {
      ...UserFragment
      deletedAt
      roles {
        admin
      }
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
      roles {
        admin
      }
      exportToken
    }
  }
  ${UserFragment}
`

export const USERS_Q = gql`
  query Users($cursor: String, $active: Boolean) {
    users(first: 15, after: $cursor, active: $active) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...UserFragment
          deletedAt
          roles {
            admin
          }
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

export const TOGGLE_ACTIVE = gql`
  mutation Active($id: ID!, $active: Boolean!) {
    activateUser(id: $id, active: $active) {
      ...UserFragment
      deletedAt
      roles {
        admin
      }
    }
  }
  ${UserFragment}
`;

export const PLAN_Q = gql`
  query {
    plan {
      license {
        ...LicenseFragment
      }
      usage {
        user
      }
    }
  }
  ${LicenseFragment}
`;