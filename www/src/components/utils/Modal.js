import React, {useState} from 'react'
import {Layer} from 'grommet'

function Modal(props) {
  const [open, setOpen] = useState(!!props.open)

  return (
    <span>
      <span onClick={() => {
        props.onOpen && props.onOpen()
        setOpen(true)
      }}>
      {props.target}
      </span>
      {open && (
        <Layer
          modal
          position={props.position || 'center'}
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)} >
          {props.children(setOpen)}
        </Layer>
      )}
    </span>

  )
}

export default Modal