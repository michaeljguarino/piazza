import React, { useRef, useState, useCallback } from "react";
import {lookahead, dupe} from '../../utils/array'
import {debounce} from 'lodash'

function Scroller({id, direction, edges, mapper, style, emptyState, offset, placeholder, onScroll, onLoadMore}) {
  const scrollRef = useRef()
  const [pos, setPos] = useState(0)
  const [loading, setLoading] = useState(false)

  const updatePosition = useCallback(debounce((pos) => setPos(pos), 200, {leading: true}), [])

  const handleOnScroll = useCallback(() => {
    const dir = direction || 'down'
    const opt = offset || 0
    if (dir === 'down') {
      let elem = document.getElementById(id)
      if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight - opt)) {
        !loading && onLoadMore(setLoading)
      }
      updatePosition(elem.scrollTop)
    } else {
      let elem = document.getElementById(id)
      if (elem.scrollTop <= elem.offsetHeight + (opt || 0)) {
        !loading && onLoadMore(setLoading)
      }
      updatePosition(elem.scrollTop)
    }
    onScroll && onScroll()
  }, [])


  let entries = Array.from(lookahead(edges, (edge, next) => mapper(edge, next, scrollRef, pos)))
  if (loading && placeholder) {
    entries = entries.concat(Array.from(dupe(20, placeholder)))
  }

  return (
    <div ref={scrollRef} id={id} onScroll={handleOnScroll} style={style}>
      {entries.length > 0 ? entries : emptyState}
    </div>
  )
}

export default Scroller