import React, {useState} from 'react'
import {Layer, Box, Text} from 'grommet'
import {FormClose} from 'grommet-icons'

export function ModalHeader({big, ...props}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      direction='row'
      border='bottom'
      elevation='xxsmall'
      round={props.round || {size: '4px', corner: 'top'}}
      pad='small'>
      <Box direction='row' fill='horizontal' align='center'>
        <Text size={big ? 'medium' : 'small'} weight='bold'>{props.text}</Text>
      </Box>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        background={hover ? 'light-3' : null}
        width={big ? '50px' : '30px'}
        round='xsmall'
        align='center'
        justify='center'>
        <FormClose size={big ? '30px' : null} style={{cursor: 'pointer'}} onClick={() => props.setOpen(false)} />
      </Box>
    </Box>
  )
}

function Modal({onOpen, disableClickOutside, target, children, position, ...props}) {
  const [open, setOpen] = useState(!!props.open)

  return (
    <>
      <span onClick={() => {
        onOpen && onOpen()
        setOpen(true)
      }}>
      {target}
      </span>
      {open && (
        <Layer
          modal
          position={position || 'center'}
          onClickOutside={() => !disableClickOutside && setOpen(false)}
          onEsc={() => !disableClickOutside && setOpen(false)} >
          {children(setOpen)}
        </Layer>
      )}
    </>

  )
}

export default Modal