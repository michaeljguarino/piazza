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
    phone
    title
  }
`;

export const LicenseFragment = gql`
  fragment LicenseFragment on License {
    features {
      name
      description
    }
    plan
    limits {
      user
    }
  }
`;