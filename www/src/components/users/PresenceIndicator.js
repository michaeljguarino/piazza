import React, { useContext } from 'react'
import { ThemeContext } from '../Workspace'

export function EmptyPresenceIndicator({emptyColor}) {
  return (
    <span style={{
      height: '.5em',
      width: '.5em',
      borderRadius: '50%',
      border: '1px solid',
      borderColor: emptyColor || '#EDEDED',
      display: 'inline-block'
    }} />
  )
}

export default function PresenceIndicator({present}) {
  const {theme} = useContext(ThemeContext)
  if (!present) return null

  return (
    <span style={{
      height: '.5em',
      width: '.5em',
      backgroundColor: theme.global.colors.presence,
      border: '1px solid',
      borderColor: theme.global.colors.presence,
      borderRadius: '50%',
      display: 'inline-block'
    }} />
  )
}