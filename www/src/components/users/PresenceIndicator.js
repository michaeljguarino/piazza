import React from 'react'

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
  return (props.present ?
    <span style={{
      height: '.5em',
      width: '.5em',
      backgroundColor: '#006633',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '5px'
    }} /> :
    <span></span>
  )
}

export default PresenceIndicator