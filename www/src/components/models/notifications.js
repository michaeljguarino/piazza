import gql from 'graphql-tag'
import { UserFragment } from './users'
import { WorkspaceFragment } from './workspace';

export const NotificationFragment=gql`
  fragment NotificationFragment on Notification {
    id
    type
    actor {
      ...UserFragment
    }
    workspace {
      ...WorkspaceFragment
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
  ${WorkspaceFragment}
  ${UserFragment}
`;