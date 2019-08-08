import gql from 'graphql-tag'

export const UserFragment = gql`
  fragment UserFragment on User {
    id
    bot
    bio
    name
    email
    handle
    backgroundColor
    avatar
  }
`;