import gql from 'graphql-tag'

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($attributes: ConversationAttributes!) {
    createConversation(attributes: $attributes) {
      id
      name
      topic
      unreadMessages
    }
  }
`


export const UPDATE_CONVERSATION = gql`
  mutation UpdateConversation($id: ID!, $attributes: ConversationAttributes!) {
    updateConversation(id: $id, attributes: $attributes) {
      id
      name
      topic
      unreadMessages
    }
  }
`;

export const CONVERSATIONS_Q = gql`
  query Conversations($cursor: String) {
    conversations(first: 20, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
          topic
          unreadMessages
        }
      }
    }
  }
`

export const PARTICIPANTS_Q = gql`
  query ParticipantQ($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      name
      topic
      participants(first: 25, after: $cursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id
            user {
              id
              name
              handle
              backgroundColor
            }
          }
        }
      }
    }
  }
`

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
        id
        user {
          id
          name
          handle
          backgroundColor
        }
      }
    }
  }
`;

export const MESSAGES_Q = gql`
  query ConversationQuery($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      messages(first: 100, after: $cursor) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id
            text
            insertedAt
            attachment
            entities {
              type
              startIndex
              length
              user {
                id
                name
                handle
                backgroundColor
                avatar
              }
            }
            creator {
              id
              name
              handle
              backgroundColor
              bot
              avatar
            }
            embed {
              type
              url
              image_url
              title
              description
              width
              height
            }
          }
        }
      }
    }
  }
`
export const NEW_MESSAGES_SUB = gql`
  subscription MessageDeltas($conversationId: ID!) {
    messageDelta(conversationId: $conversationId) {
      delta
      payload {
        id
        text
        insertedAt
        attachment
        creator {
          id
          name
          handle
          backgroundColor
          bot
          avatar
        }
        entities {
          type
          startIndex
          length
          user {
            id
            name
            handle
            backgroundColor
            avatar
          }
        }
        embed {
          type
          url
          title
          image_url
          description
          width
          height
        }
      }
    }
  }
`;

export const CONVERSATIONS_SUB = gql`
  subscription {
    participantDelta {
      delta
      payload {
        id
        conversation {
          id
          name
          topic
          unreadMessages
        }
      }
    }
  }
`;

export const CREATE_CHAT = gql`
  mutation CreateChat($userId: ID!) {
    createChat(userId: $userId) {
      id
      name
      topic
      unreadMessages
    }
  }
`;