import React from 'react'
import {ThemeContext} from '../Theme'

export function EmptyPresenceIndicator(props) {
  return (
    <span style={{
      height: '.5em',
      width: '.5em',
      borderRadius: '50%',
      border: '1px solid',
      borderColor: props.emptyColor || '#EDEDED',
      display: 'inline-block',
      marginRight: '5px'
    }} />
  )
}

function PresenceIndicator(props) {

  return (
  <ThemeContext.Consumer>
  {({theme}) => (props.present ?
    <span style={{
      height: '.5em',
      width: '.5em',
      backgroundColor: theme.global.colors.presence,
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '5px'
    }} /> :
    <span></span>
  )}
  </ThemeContext.Consumer>
  )
}

export default PresenceIndicator