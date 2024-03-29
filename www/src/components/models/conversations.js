import gql from 'graphql-tag'
import { UserFragment } from './users'
import { EmojiFragment } from './emoji'
import { WorkspaceFragment } from './workspace';

export const ConversationFragment = gql`
  fragment ConversationFragment on Conversation {
    id
    name
    chat
    public
    topic
    archivedAt
    unreadMessages
    unreadNotifications
    workspace {
      ...WorkspaceFragment
    }
    currentParticipant {
      lastSeenAt
      notificationPreferences {
        mention
        participant
        message
      }
    }
    chatParticipants {
      user {
        ...UserFragment
      }
    }
  }
  ${WorkspaceFragment}
  ${UserFragment}
`;

export const EmbedFragment = gql`
  fragment EmbedFragment on Embed {
    type
    videoType
    url
    imageUrl
    title
    description
    width
    height
    publisher
    logo
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

export const FileFragment = gql`
  fragment FileFragment on File {
    id
    filename
    filesize
    mediaType
    contentType
    object
    insertedAt
    height
    width
  }
`;

export const MessageSubFragment = gql`
  fragment MessageSubFragment on Message {
    id
    text
    insertedAt
    pinnedAt
    structuredMessage
    conversationId
    entities {
      id
      type
      startIndex
      length
      text
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
    file {
      ...FileFragment
    }
  }
  ${EmbedFragment}
  ${UserFragment}
  ${ReactionFragment}
  ${EmojiFragment}
  ${FileFragment}
`;

export const MessageFragment = gql`
  fragment MessageFragment on Message {
    ...MessageSubFragment
    parent {
      ...MessageSubFragment
    }
  }
  ${MessageSubFragment}
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