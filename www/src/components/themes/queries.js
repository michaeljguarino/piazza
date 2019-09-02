import gql from 'graphql-tag'
import {ThemeFragment} from '../models/brand'

export const BRAND_Q = gql`
  query {
    brand {
      theme {
        ...ThemeFragment
      }
    }
  }
  ${ThemeFragment}
`;

export const THEME_Q = gql`
  query Themes($cursor: String) {
    themes(first: 10, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...ThemeFragment
        }
      }
    }
  }
  ${ThemeFragment}
`;

export const SET_THEME = gql`
  mutation SetTheme($id: ID!) {
    setTheme(id: $id) {
      ...ThemeFragment
    }
  }
  ${ThemeFragment}
`;