import React, { useRef, useEffect } from "react"
import {lookahead} from '../../utils/array'
import scrollIntoView from 'scroll-into-view'

export const DIRECTION = {
  BEFORE: "before",
  AFTER: "after"
}

function DualScroller(props) {
  const scrollRef = useRef()

  useEffect(() => {
    if (props.scrollTo) {
      scrollIntoView(document.getElementById(props.scrollTo), {time: 100, align: {top: 0}})
    }
  }, [props.scrollTo])

  const handleOnScroll = () => {
    let elem = document.getElementById(props.id);
    if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight)) {
      props.onLoadMore(DIRECTION.AFTER);
    }

    if (elem.scrollTop <= elem.offsetHeight) {
      props.onLoadMore(DIRECTION.BEFORE)
    }
  }


  let entries = Array.from(lookahead(props.edges, (edge, next) => props.mapper(edge, next, scrollRef)))
  return (
    <div ref={scrollRef} id={props.id} onScroll={handleOnScroll} style={props.style}>
      {entries.length > 0 ? entries : props.emptyState}
    </div>
  )
}

export default DualScroller