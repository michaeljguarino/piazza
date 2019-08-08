import React, {useState, useRef} from 'react'
import {Drop} from 'grommet'

function CloseableDropdown(props) {
  const targetRef = useRef();
  const [open, setOpen] = useState(!!props.open);

  return (
    <span>
      <span onClick={() => {
          props.onClick && props.onClick()
          setOpen(true)
        }} ref={targetRef}>
        {props.target}
      </span>
      {open && (
        <Drop
          align={props.align || { top: "bottom"}}
          target={targetRef.current}
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
        >
          {props.children(setOpen)}
        </Drop>)}
    </span>
  )
}

export default CloseableDropdown