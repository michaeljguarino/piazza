import React, {useState, useRef} from 'react'
import {Box, Drop} from 'grommet'

function Tooltip(props) {
  const targetRef = useRef()
  const [open, setOpen] = useState(false)

  const target = props.children[0]
  const dropContents = props.children.slice(1)
  return (
    <>
      <span
        ref={targetRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}>
        {target}
      </span>
      {open && (
        <Drop align={props.align || {bottom: 'top'}} target={targetRef.current} plain>
          <Box round='small' background={props.background || 'dark-1'} pad='xsmall'>
            {dropContents}
          </Box>
        </Drop>
      )}
    </>
  )
}

export default Tooltip