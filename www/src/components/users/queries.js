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