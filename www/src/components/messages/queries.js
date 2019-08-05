import gql from 'graphql-tag'

export const MESSAGES_Q = gql`
  query ConversationQuery($conversationId: ID!, $cursor: String) {
    conversation(id: $conversationId) {
      id
      messages(first: 15, after: $cursor) {
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

export const MESSAGE_MUTATION = gql`
  mutation CreateMessage($conversationId: ID!, $attributes: MessageAttributes!) {
    createMessage(conversationId: $conversationId, attributes: $attributes) {
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
`

export const SEARCH_USERS=gql`
  query SearchUsers($name: ID!) {
    searchUsers(name: $name, first: 10) {
      edges {
        node {
          id
          name
          handle
          backgroundColor
          avatar
        }
      }
    }
  }
`;