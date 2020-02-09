import gql from 'graphql-tag'
import { UserFragment } from '../models/users';
import { EmojiFragment } from '../models/emoji';
import { ConversationFragment } from '../models/conversations';


export const CONTEXT_Q = gql`
  query Context($workspaceId: ID, $cursor: String, $chatCursor: String) {
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
    emoji(first: 100) {
      edges {
        node {
          ...EmojiFragment
        }
      }
    }
    conversations(workspaceId: $workspaceId, first: 20, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...ConversationFragment
        }
      }
    }
    chats(first: 20, after: $chatCursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...ConversationFragment
        }
      }
    }
  }
  ${UserFragment}
  ${EmojiFragment}
  ${ConversationFragment}
`;