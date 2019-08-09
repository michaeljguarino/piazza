import gql from 'graphql-tag'
import {UserFragment} from './users'

export const CommandFragment=gql`
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
  }
  ${UserFragment}
`;