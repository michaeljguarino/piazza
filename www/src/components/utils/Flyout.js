import React, {useState} from 'react'
import {Layer, Box, Text} from 'grommet'

export function FlyoutHeader(props) {
  return (
    <Box background='light-3' elevation='xsmall' pad='small' margin={{bottom: 'small'}}>
      <Text size='small' weight='bold'>{props.text}</Text>
    </Box>
  )
}

function Flyout(props) {
  const [open, setOpen] = useState(!!props.open)

  return (
    <span style={{lineHeight: '0px'}}>
      <span onClick={() => {
        props.onOpen && props.onOpen()
        setOpen(true)
      }}>
      {props.target}
      </span>
      {open && (
        <Layer
          position="right"
          full="vertical"
          modal
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
        >
          {props.children(setOpen)}
        </Layer>
      )}
    </span>
  )
}

export default Flyout