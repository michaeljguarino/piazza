import React from 'react'
import {Query} from 'react-apollo'
import {SearchInput} from './utils/SelectSearchInput'
import Loading from './utils/Loading'
import {BRAND_Q} from './themes/queries'

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
  presence: '#006633'
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
        borderRadius: '5px',
        fontWeight: 'normal'
      }
    }
  },
  textField: {
    extend: {
      fontWeight: 400
    }
  },
  global: {
    colors: DEFAULT_COLOR_THEME,
    drop: {
      border: {
        radius: '2px'
      }
    },
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
  },
}

function buildTheme(theme) {
  let merged = {...DEFAULT_THEME}
  merged.global.colors = {...DEFAULT_COLOR_THEME, ...theme}
  if (theme.link) {
    merged.anchor.color = {dark: theme.link, light: theme.link}
  }
  return merged
}

export const ThemeContext = React.createContext({theme: {}, name: null, id: null, brand: null})

function Theme(props) {
  return (
    <Query query={BRAND_Q}>
    {({loading, data}) => {
      if (loading) return <Loading height='100vh' width='100vw' />
      const brand = data.brand
      const {id, name, ...themeAttrs} = brand.theme
      const theme = buildTheme(themeAttrs)
      return (
        <ThemeContext.Provider value={{theme, name, id, brand}}>
          {props.children(theme)}
        </ThemeContext.Provider>
      )
    }}
    </Query>
  )
}

export default Theme