import gql from 'graphql-tag'
import {EmojiFragment} from '../models/emoji'

export const EMOJI_Q = gql`
  query {
    emoji(first: 100) {
      edges {
        node {
          ...EmojiFragment
        }
      }
    }
  }
  ${EmojiFragment}
`;

export const CREATE_EMOJI = gql`
  mutation CreateEmoji($name: String!, $image: UploadOrUrl) {
    createEmoji(attributes: {name: $name, image: $image}) {
      ...EmojiFragment
    }
  }
  ${EmojiFragment}
`;