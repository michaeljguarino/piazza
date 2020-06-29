import React from 'react'
import {Layer, Box} from 'grommet'

function Pill({pad, margin, onClose, background, children}) {
  return (
    <Layer plain modal={false} position='top' onEsc={onClose} onClickOutside={onClose}>
      <Box
        direction='row'
        align='center'
        elevation='medium'
        round='small'
        margin={margin ||  {top: 'medium'}}
        pad={pad || {vertical: 'xsmall', horizontal: 'medium'}}
        background={background}>
        {children}
      </Box>
    </Layer>
  )
}

export default Pill