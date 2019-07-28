import React, {useState, useRef} from 'react'
import {Drop} from 'grommet'

function Dropdown(props) {
  const targetRef = useRef();
  const [open, setOpen] = useState(!!props.open);

  let first = props.children[0]
  let rest  = props.children.slice(1)
  return (
    <div>
      <div onClick={() => setOpen(true)} ref={targetRef}>
        {first}
      </div>
      {open && (
        <Drop
          align={props.align || { top: "bottom", left: "left" }}
          target={targetRef.current}
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
        >
          {rest}
        </Drop>)}
    </div>
  )
}

export default Dropdown