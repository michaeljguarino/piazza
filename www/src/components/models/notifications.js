import gql from 'graphql-tag'
import {UserFragment} from './users'

export const NotificationFragment=gql`
  fragment NotificationFragment on Notification {
    id
    type
    actor {
      ...UserFragment
    }
    message {
      id
      text
      conversation {
        id
        name
        topic
        chat
        chatParticipants {
          user {
            id
            name
            handle
          }
        }
      }
    }
  }
  ${UserFragment}
`;