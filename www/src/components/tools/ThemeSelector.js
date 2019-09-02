import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {HOTH} from '../themes'
import {saveTheme, currentTheme} from '../Theme'

function ThemeChoice(props) {
  const [hover, setHover] = useState(false)
  const selected = props.current === props.label.toLowerCase()
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{cursor: 'pointer'}}
      border={selected || hover}
      onClick={props.onClick}
      pad='small'>
      <Text size='small'>{props.label}</Text>
    </Box>
  )
}

function ThemeSelector(props) {
  function saveAndRefresh(name, theme) {
    saveTheme(name, theme)
    window.location.reload(false)
  }

  const current = currentTheme()
  return (
    <Box width='300px' gap='small' pad='small'>
      <ThemeChoice current={current} label='Default' onClick={() => saveAndRefresh('default', null)} />
      <ThemeChoice current={current} label='Hoth' onClick={() => saveAndRefresh('hoth', HOTH)} />
    </Box>
  )
}

export default ThemeSelector

