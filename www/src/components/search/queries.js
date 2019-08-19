import gql from 'graphql-tag'
import {ConversationFragment} from '../models/conversations'

export const SEARCH_Q=gql`
query SearchQuery($q : String!) {
  searchConversations(name: $q, first: 10) {
    edges {
      node {
        ...ConversationFragment
      }
    }
  }
}
${ConversationFragment}
`;