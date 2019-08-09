import gql from 'graphql-tag'
import {CommandFragment} from '../models/commands'

export const COMMANDS_Q = gql`
  query Commands($cursor: String) {
    commands(first: 15, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...CommandFragment
        }
      }
    }
  }
  ${CommandFragment}
`;

export const SEARCH_COMMANDS = gql`
  query SearchCommands($name: String!) {
    searchCommands(name: $name, first: 10) {
      edges {
        node {
          ...CommandFragment
        }
      }
    }
  }
  ${CommandFragment}
`;
