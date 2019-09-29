import React, { useRef } from "react";
import {lookahead} from '../../utils/array'

function Scroller(props) {
  const scrollRef = useRef()

  const handleOnScroll = () => {
    let direction = props.direction || 'down'
    if (direction === 'down') {
      let elem = document.getElementById(props.id)
      if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight)) {
        props.onLoadMore()
      }
    } else {
      let elem = document.getElementById(props.id)
      if (elem.scrollTop <= elem.offsetHeight) {
        console.log('scrolling')
        props.onLoadMore()
      }
    }
  }

  let entries = Array.from(lookahead(props.edges, (edge, next) => props.mapper(edge, next, scrollRef)))
  return (
    <div ref={scrollRef} id={props.id} onScroll={handleOnScroll} style={props.style}>
      {entries.length > 0 ? entries : props.emptyState}
    </div>
  )
}

export default Scroller