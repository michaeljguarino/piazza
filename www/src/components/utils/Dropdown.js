import React, {useEffect, useState, useRef} from 'react'
import {Drop} from 'grommet'

function Dropdown(props) {
  const node = useRef();
  const targetRef = useRef();
  const [open, setOpen] = useState(false);

  const handleClickOutside = e => {
    console.log("clicking anywhere");
    if (node.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  let first = props.children[0]
  let rest  = props.children.slice(1)
  return (
    <div ref={node}>
      <div onClick={() => setOpen(true)} ref={targetRef}>
        {first}
      </div>
      {open && (
        <Drop
          align={props.align || { top: "bottom", left: "left" }}
          target={targetRef.current}
        >
          {rest}
        </Drop>)}
    </div>
  )
}

export default Dropdown