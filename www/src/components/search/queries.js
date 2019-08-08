import gql from 'graphql-tag'


export const SEARCH_Q=gql`
query SearchQuery($q : String!) {
  searchConversations(name: $q, first: 10) {
    edges {
      node {
        id
        name
        topic
        unreadMessages
        currentParticipant {
          notificationPreferences {
            mention
            message
            participant
          }
        }
      }
    }
  }
}
`;