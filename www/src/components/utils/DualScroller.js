import React, { useRef, useEffect, useState } from "react"
import {lookahead} from '../../utils/array'
import scrollIntoView from 'scroll-into-view'
import {debounce} from 'lodash'

export const DIRECTION = {
  BEFORE: "before",
  AFTER: "after"
}

function DualScroller(props) {
  const scrollRef = useRef()
  const [pos, setPos] = useState(0)

  const updatePosition = debounce((pos) => setPos(pos), 100, {leading: true})

  useEffect(() => {
    if (props.scrollTo) {
      scrollIntoView(document.getElementById(props.scrollTo), {time: 100, align: {top: 0}})
    }
  }, [props.scrollTo])

  const handleOnScroll = () => {
    let elem = document.getElementById(props.id);
    if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight)) {
      props.onLoadMore(DIRECTION.AFTER)
    }

    if (elem.scrollTop <= elem.offsetHeight) {
      props.onLoadMore(DIRECTION.BEFORE)
    }
    updatePosition(elem.scrollTop)
  }

  let entries = Array.from(lookahead(props.edges, (edge, next) => props.mapper(edge, next, scrollRef, pos)))
  return (
    <div ref={scrollRef} id={props.id} onScroll={handleOnScroll} style={props.style}>
      {entries.length > 0 ? entries : props.emptyState}
    </div>
  )
}

export default DualScroller