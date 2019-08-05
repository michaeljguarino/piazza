import gql from 'graphql-tag'

export const COMMANDS_Q = gql`
query Commands($cursor: String) {
  commands(first: 15, after: $cursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        name
        documentation
        bot {
          id
          name
          handle
          bot
        }
        webhook {
          url
        }
      }
    }
  }
}
`;

export const SEARCH_COMMANDS = gql`
  query SearchCommands($name: String!) {
    searchCommands(name: $name, first: 10) {
      edges {
        node {
          id
          name
          bot {
            id
            name
            handle
            backgroundColor
            avatar
          }
        }
      }
    }
  }
`;