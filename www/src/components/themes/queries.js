import gql from 'graphql-tag'
import {ThemeFragment} from '../models/brand'

export const BRAND_Q = gql`
  query {
    brand {
      themeId
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

export const UPDATE_BRAND = gql`
  mutation UpdateBrand($id: ID!) {
    updateBrand(attributes: {themeId: $id}) {
      id
    }
  }
`;

export const CREATE_THEME = gql`
  mutation CreateTheme($name: String!, $attributes: ThemeAttributes!) {
    createTheme(name: $name, attributes: $attributes) {
      ...ThemeFragment
    }
  }
  ${ThemeFragment}
`;