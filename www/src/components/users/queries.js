import gql from 'graphql-tag'

export const UPDATE_USER=gql`
  mutation UpdateUser($id: ID!, $attributes: UserAttributes!) {
    updateUser(id: $id, attributes: $attributes) {
      id
      bio
      name
      email
      handle
      bot
      avatar
      backgroundColor
    }
  }
`;

export const ME_Q=gql`
  query {
    me {
      id
      bio
      name
      handle
      backgroundColor
      avatar
      notificationPreferences {
        mention
      }
      unseenNotifications
    }
  }
`