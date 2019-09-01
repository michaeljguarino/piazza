import React, {useState} from 'react'
import {Layer, Box, Text} from 'grommet'
import {FormClose} from 'grommet-icons'

export function ModalHeader(props) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      direction='row'
      // background='brand'
      border='bottom'
      elevation='xxsmall'
      round={props.round || {size: '4px', corner: 'top'}}
      pad='small'
      margin={{bottom: 'xsmall'}}>
      <Box direction='row' fill='horizontal' align='center'>
        <Text size='small' weight='bold'>{props.text}</Text>
      </Box>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        background={hover ? 'light-6' : null}
        width='30px'
        align='center'
        justify='center'>
        <FormClose style={{cursor: 'pointer'}} onClick={() => props.setOpen(false)} />
      </Box>
    </Box>
  )
}

function Modal(props) {
  const [open, setOpen] = useState(!!props.open)

  return (
    <>
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
    </>

  )
}

export default Modal