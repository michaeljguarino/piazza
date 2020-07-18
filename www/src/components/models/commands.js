import gql from 'graphql-tag'
import { UserFragment } from './users'

export const UnfurlerFragment = gql`
  fragment UnfurlerFragment on Unfurler {
    regex
    value
  }
`;

export const CommandFragment = gql`
  fragment CommandFragment on Command {
    id
    name
    documentation
    description
    bot {
      ...UserFragment
    }
    webhook {
      url
    }
    unfurlers {
      ...UnfurlerFragment
    }
    incomingWebhook {
      conversation {
        name
      }
      url
    }
  }
  ${UserFragment}
  ${UnfurlerFragment}
`;