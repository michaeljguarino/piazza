import gql from 'graphql-tag'

export const ThemeFragment = gql`
  fragment ThemeFragment on Theme {
    id
    name

    brand
    sidebar
    sidebarHover
    focus
    action
    actionHover
    focusText
    activeText
    tagLight
    tagMedium
    presence
    notif
    link
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