import React, { useRef, useState } from "react";
import {lookahead, dupe} from '../../utils/array'
import {debounce} from 'lodash'

function Scroller({loading, placeholder, ...props}) {
  const scrollRef = useRef()
  const [pos, setPos] = useState(0)

  const updatePosition = debounce((pos) => setPos(pos), 100, {leading: true})

  const handleOnScroll = () => {
    let direction = props.direction || 'down'
    if (direction === 'down') {
      let elem = document.getElementById(props.id)
      if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight)) {
        !loading && props.onLoadMore()
      }
      updatePosition(elem.scrollTop)
    } else {
      let elem = document.getElementById(props.id)
      if (elem.scrollTop <= elem.offsetHeight) {
        !loading && props.onLoadMore()
      }
      updatePosition(elem.scrollTop)
    }
  }

  let entries = Array.from(lookahead(props.edges, (edge, next) => props.mapper(edge, next, scrollRef, pos)))
  if (loading && placeholder) {
    entries = entries.concat(Array.from(dupe(20, placeholder)))
  }
  return (
    <div ref={scrollRef} id={props.id} onScroll={handleOnScroll} style={props.style}>
      {entries.length > 0 ? entries : props.emptyState}
    </div>
  )
}

export default Scroller