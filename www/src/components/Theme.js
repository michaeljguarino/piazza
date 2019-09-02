import React, {useState} from 'react'
import {SearchInput} from './utils/SelectSearchInput'

export const DEFAULT_COLOR_THEME = {
  brand: '#2F415B',
  'accent-1': '#CF6D57',
  focus: '#CF6D57',
  'brand-heavy': '#263449',
  'tag-light': '#6d7a8c',
  'tag-medium': '#59677c',
  'focus-text': '#FFFFFF',
  'active-text': '#FFFFFF',
  'sidebar-text': '#C0C0C0',
  'sidebar-text-hover': '#FFFFFF',
  'highlight': '#cdd7e5',
  'highlight-dark': '#a4acb7',
  notif: '#EB4D5C',
  'light-hover': '#EDEDED',
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
  textInput: {
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

const STORAGE_KEY = 'piazza-theme'

export function saveTheme(name, theme) {
  if (!theme) {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY + '-current')
    return
  }
  localStorage.setItem(STORAGE_KEY + '-current', name)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
}

export function currentTheme() {
  return localStorage.getItem(STORAGE_KEY + '-current') || 'default'
}

export function fetchTheme() {
  const item = localStorage.getItem(STORAGE_KEY)
  if (!item) return DEFAULT_COLOR_THEME
  return JSON.parse(item)
}

function buildTheme(theme) {
  let merged = {...DEFAULT_THEME}
  merged.global.colors = {...DEFAULT_COLOR_THEME, ...theme}
  if (theme.link) {
    merged.anchor.color = {dark: theme.link, light: theme.link}
  }
  return merged
}

export const ThemeContext = React.createContext({theme: {}, setTheme: null})

function Theme(props) {
  const [theme, setTheme] = useState(buildTheme(fetchTheme()))
  function wrappedSetTheme(theme) {
    setTheme(buildTheme(theme))
  }

  return (
    <ThemeContext.Provider value={{theme, setTheme: wrappedSetTheme}}>
      {props.children(theme)}
    </ThemeContext.Provider>
  )
}

export default Theme