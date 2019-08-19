import React, {useState} from 'react'
import {Layer, Box, Text} from 'grommet'

export function ModalHeader(props) {
  return (
    <Box background='brand' elevation='xsmall' pad='small' margin={{bottom: 'xsmall'}}>
      <Text size='small' weight='bold'>{props.text}</Text>
    </Box>
  )
}

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