import gql from 'graphql-tag'
import {UserFragment} from './users'
import {EmojiFragment} from './emoji'

export const ConversationFragment = gql`
  fragment ConversationFragment on Conversation {
    id
    name
    chat
    public
    topic
    unreadMessages
    unreadNotifications
    currentParticipant {
      notificationPreferences {
        mention
        participant
        message
      }
    }
    chatParticipants {
      user {
        id
        name
        handle
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

export const ReactionFragment = gql`
  fragment ReactionFragment on MessageReaction {
    messageId
    name
    user {
      id
      handle
    }
  }
`;

export const MessageFragment = gql`
  fragment MessageFragment on Message {
    id
    text
    insertedAt
    pinnedAt
    attachment
    structuredMessage
    entities {
      type
      startIndex
      length
      user {
        ...UserFragment
      }
      emoji {
        ...EmojiFragment
      }
    }
    creator {
      ...UserFragment
    }
    embed {
      ...EmbedFragment
    }
    reactions {
      ...ReactionFragment
    }
    pin {
      user {
        handle
      }
    }
  }
  ${EmbedFragment}
  ${UserFragment}
  ${ReactionFragment}
  ${EmojiFragment}
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