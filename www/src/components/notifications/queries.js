import gql from 'graphql-tag'
import {NotificationFragment} from '../models/notifications'

export const NOTIFICATIONS_Q=gql`
  query Notifications($cursor: String) {
    notifications(first: 20, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...NotificationFragment
        }
      }
    }
  }
  ${NotificationFragment}
`;

export const VIEW_NOTIFICATIONS = gql`
  mutation {
    viewNotifications {
      id
    }
  }
`;

export const NEW_NOTIFICATIONS_SUB = gql`
  subscription {
    newNotifications {
      ...NotificationFragment
    }
  }
  ${NotificationFragment}
`;