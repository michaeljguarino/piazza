import React, { useContext } from 'react'
import { ThemeContext } from '../Theme'

export function EmptyPresenceIndicator({emptyColor}) {
  return (
    <span style={{
      height: '.5em',
      width: '.5em',
      borderRadius: '50%',
      border: '1px solid',
      borderColor: emptyColor || '#EDEDED',
      display: 'inline-block',
      marginRight: '5px'
    }} />
  )
}

export default function PresenceIndicator({present}) {
  const {theme} = useContext(ThemeContext)
  if (!present) return <span />

  return (
    <span style={{
      height: '.5em',
      width: '.5em',
      backgroundColor: theme.global.colors.presence,
      border: '1px solid',
      borderColor: theme.global.colors.presence,
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '5px'
    }} />
  )
}