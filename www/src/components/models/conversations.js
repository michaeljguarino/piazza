import gql from 'graphql-tag'
import {UserFragment} from './users'

export const ConversationFragment = gql`
  fragment ConversationFragment on Conversation {
    id
    name
    public
    topic
    unreadMessages
    currentParticipant {
      notificationPreferences {
        mention
        participant
        message
      }
    }
  }
`;

export const EmbedFragment = gql`
  fragment EmbedFragment on Embed {
    type
    url
    image_url
    title
    description
    width
    height
  }
`;

export const MessageFragment = gql`
  fragment MessageFragment on Message {
    id
    text
    insertedAt
    attachment
    entities {
      type
      startIndex
      length
      user {
        ...UserFragment
      }
    }
    creator {
      ...UserFragment
    }
    embed {
      ...EmbedFragment
    }
  }
  ${EmbedFragment}
  ${UserFragment}
`;

export const ParticipantFragment = gql`
  fragment ParticipantFragment on Participant {
    id
    user {
      ...UserFragment
    }
  }
  ${UserFragment}
`;