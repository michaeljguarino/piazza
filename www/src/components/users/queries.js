import gql from 'graphql-tag'
import { UserFragment, LicenseFragment } from '../models/users'

export const UPDATE_USER=gql`
  mutation UpdateUser($id: ID!, $attributes: UserAttributes!) {
    updateUser(id: $id, attributes: $attributes) {
      ...UserFragment
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
  query Users($cursor: String) {
    users(first: 15, after: $cursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...UserFragment
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