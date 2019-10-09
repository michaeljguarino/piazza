import gql from 'graphql-tag'
import {ConversationFragment, ParticipantFragment, FileFragment} from '../models/conversations'

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($attributes: ConversationAttributes!) {
    createConversation(attributes: $attributes) {
      ...ConversationFragment
    }
  }
  ${ConversationFragment}
`

export const UPDATE_CONVERSATION = gql`
  mutation UpdateConversation($id: ID!, $attributes: ConversationAttributes!) {
    updateConversation(id: $id, attributes: $attributes) {
      ...ConversationFragment
    }
  }
  ${ConversationFragment}
`;

export const CONVERSATIONS_Q = gql`
  query Conversations($cursor: String, $chatCursor: String) {
    conversations(first: 20, after: $cursor) {
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
  ${ConversationFragment}
`

export const PARTICIPANTS_Q = gql`
  query ParticipantQ($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      name
      topic
      participantCount
      participants(first: 25, after: $cursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            ...ParticipantFragment
          }
        }
      }
    }
  }
  ${ParticipantFragment}
`

export const FILES_Q = gql`
query Files($conversationId: ID!, $cursor: String) {
  conversation(id: $conversationId) {
    id
    name
    topic
    fileCount
    files(first: 25, after: $cursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...FileFragment
        }
      }
    }
  }
}
${FileFragment}
`;

export const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($id: ID!) {
    deleteConversation(id: $id) {
      id
    }
  }
`;

export const PARTICIPANT_SUB = gql`
  subscription ParticipantDeltas($conversationId: ID!) {
    participantDelta(conversationId: $conversationId) {
      delta
      payload {
        ...ParticipantFragment
      }
    }
  }
  ${ParticipantFragment}
`;

export const CONVERSATIONS_SUB = gql`
  subscription {
    participantDelta {
      delta
      payload {
        id
        conversation {
          ...ConversationFragment
        }
      }
    }
  }
  ${ConversationFragment}
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($userIds: [ID]) {
    createChat(userIds: $userIds) {
      ...ConversationFragment
    }
  }
  ${ConversationFragment}
`;

export const CREATE_PARTICIPANTS = gql`
  mutation CreateParticipants($conversationId: ID!, $handles: [String]) {
    createParticipants(conversationId: $conversationId, handles: $handles) {
      ...ParticipantFragment
    }
  }
  ${ParticipantFragment}
`;

export const UPDATE_PARTICIPANT = gql`
  mutation UpdateParticipant($conversationId: ID!, $userId: ID!, $prefs: NotificationPrefs!) {
    updateParticipant(userId: $userId, conversationId: $conversationId, notificationPreferences: $prefs) {
      notificationPreferences {
        mention
        message
        participant
      }
    }
  }
`;

export const DELETE_PARTICIPANT = gql`
  mutation DeleteParticipant($conversationId: ID!, $userId: ID!) {
    deleteParticipant(userId: $userId, conversationId: $conversationId) {
      id
      conversationId
    }
  }
`;

export const CREATE_INVITE = gql`
  mutation CreateInvite($reference: String!) {
    createInvite(attributes: {type: CONVERSATION, reference: $reference}) {
      token
    }
  }
`;