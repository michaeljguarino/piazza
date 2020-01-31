import React, { useRef, useEffect, useState } from "react"
import {lookahead} from '../../utils/array'
import scrollIntoView from 'scroll-into-view'
import {debounce} from 'lodash'

export const DIRECTION = {
  BEFORE: "before",
  AFTER: "after"
}

function DualScroller({id, scrollTo, offset, onLoadMore, edges, mapper, emptyState, style}) {
  const scrollRef = useRef()
  const [pos, setPos] = useState(0)

  const updatePosition = debounce((pos) => setPos(pos), 100, {leading: true})

  useEffect(() => {
    if (scrollTo) {
      scrollIntoView(document.getElementById(scrollTo), {time: 100, align: {top: 0}})
    }
  }, [scrollTo])

  const handleOnScroll = () => {
    const elem = scrollRef.current
    const off = (offset || 0) * elem.scrollHeight

    if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight - off)) {
      onLoadMore(DIRECTION.AFTER)
    }

    if (elem.scrollTop <= elem.offsetHeight + off) {
      onLoadMore(DIRECTION.BEFORE)
    }
    updatePosition(elem.scrollTop)
  }

  const entries = Array.from(lookahead(edges, (edge, next) => mapper(edge, next, scrollRef, pos)))
  return (
    <div ref={scrollRef} id={id} onScroll={handleOnScroll} style={style}>
      {entries.length > 0 ? entries : emptyState}
    </div>
  )
}

export default DualScroller