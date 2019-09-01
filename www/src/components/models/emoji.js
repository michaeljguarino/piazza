import gql from 'graphql-tag'

export const EmojiFragment = gql`
  fragment EmojiFragment on Emoji {
    name
    imageUrl
  }
`;