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

export const CREATE_COMMAND = gql`
  mutation CreateCommand(
      $name: String!,
      $documentation: String,
      $description: String,
      $incomingWebhook: IncomingWebhookAttributes,
      $url: String!) {
    createCommand(attributes: {
      name: $name,
      documentation: $documentation,
      description: $description,
      webhook: {url: $url},
      incomingWebhook: $incomingWebhook
    }) {
      ...CommandFragment
    }
  }
  ${CommandFragment}
`;

export const UPDATE_COMMAND = gql`
  mutation UpdateCommand(
    $commandName: String!,
    $name: String!,
    $documentation: String,
    $description: String,
    $incomingWebhook: IncomingWebhookAttributes,
    $url: String!) {
    updateCommand(name: $commandName, attributes: {
      name: $name,
      documentation: $documentation,
      description: $description,
      webhook: {url: $url},
      incomingWebhook: $incomingWebhook
    }) {
      ...CommandFragment
    }
  }
  ${CommandFragment}
`;
