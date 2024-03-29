import React, { useEffect, useMemo } from 'react'
import { useQuery } from 'react-apollo'
import { Loading } from 'forge-core'
import { SearchInput } from 'forge-core'
import { WORKSPACE_Q } from './workspace/queries'
import { css } from 'styled-components'

const boxStyle = css`
  outline: none !important;
`;

export const DEFAULT_COLOR_THEME = {
  brand: '#2F415B',
  sidebar: '#2F415B',
  action: '#2F415B',
  actionHover: '#2a3b52',
  focus: '#CF6D57',
  sidebarHover: '#263449',
  tagLight: '#6d7a8c',
  tagMedium: '#59677c',
  focusText: '#FFFFFF',
  activeText: '#FFFFFF',
  sidebarText: '#C0C0C0',
  sidebarTextHover: '#FFFFFF',
  highlight: '#cdd7e5',
  highlightDark: '#a4acb7',
  notif: '#EB4D5C',
  lightHover: '#EDEDED',
  presence: '#006633',
  background: '#fffdfd',
  backgroundWhite: '#fffdfd'
}

export const DEFAULT_THEME = {
  anchor: {
    hover: {
      textDecoration: 'none',
      extend: 'font-weight: 600'
    },
    fontWeight: 400,
  },
  button: {
    padding: {
      horizontal: '6px',
      vertical: '2px'
    }
  },
  checkBox: {
    color: 'action',
    size: '20px',
    toggle: {
      size: '36px'
    }
  },
  select: {
    searchInput: SearchInput
  },
  textArea: {
    extend: {
      fontWeight: 400
    }
  },
  textInput: {
    extend: {
      fontWeight: 400
    }
  },
  calendar: {
    day: {
      extend: {
        fontWeight: 'normal'
      }
    }
  },
  textField: {
    extend: {
      fontWeight: 400
    }
  },
  drop: {border: {radius: '4px'}},
  global: {
    colors: DEFAULT_COLOR_THEME,
    drop: {border: {radius: '4px'}},
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
    box: {
      extend: boxStyle
    }
  },
}

function buildTheme(theme) {
  let merged = {...DEFAULT_THEME}
  merged.global.colors = {...DEFAULT_COLOR_THEME, ...theme}

  if (theme.link) {
    merged.anchor.color = {dark: theme.link, light: theme.link}
  }

  document.getElementById('app-theme-color')
    .setAttribute('content', merged.global.colors.sidebarHover)

  return merged
}

export const ThemeContext = React.createContext({theme: {}, name: null, id: null, brand: null})
export const WorkspaceContext = React.createContext({workspaces: []})

function WorkspaceInner({brand, workspaces: spaces, children}) {
  const {theme: {id, name, ...themeAttrs}} = brand
  const theme = useMemo(() => buildTheme(themeAttrs), [themeAttrs])
  const workspaces = spaces ? spaces.edges.map(({node}) => node) : []

  return (
    <WorkspaceContext.Provider value={{workspaces}}>
      <ThemeContext.Provider value={{theme, name, id, brand}}>
        {children(theme)}
      </ThemeContext.Provider>
    </WorkspaceContext.Provider>
  ) 
}

export default function Workspace({children}) {
  const {loading, data} = useQuery(WORKSPACE_Q, {errorPolicy: 'all'})
  if (!data && loading) return <Loading height='100vh' width='100vw' />

  return (
    <WorkspaceInner brand={data.brand} workspaces={data.workspaces}>
      {children}
    </WorkspaceInner>
  )
}