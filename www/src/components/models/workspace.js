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

export const WorkspaceFragment = gql`
  fragment WorkspaceFragment on Workspace {
    id
    name
    description
    icon
  }
`;