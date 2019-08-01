import React from 'react'

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