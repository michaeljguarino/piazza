import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Box } from 'grommet'
import InfiniteLoader from 'react-window-infinite-loader'
import { VariableSizeList } from 'react-window-reversed'
import Autosizer from 'react-virtualized-auto-sizer'
import OnMediaLoaded from './OnMediaLoaded'
import memoize from 'memoize-one'

const Item = ({ index, mapper, parentRef, isItemLoaded, placeholder, items }) => {
  if (!isItemLoaded(index)) {
    return placeholder && placeholder(index)
  }

  return mapper(items[index], items[index + 1] || {}, parentRef);
};

const ItemWrapper = React.memo(({data: {setSize, width, ...rest}, style, index, ...props}) => {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return

    setSize(index, ref.current.getBoundingClientRect().height);
  }, [ref, width]);

  return (
    <OnMediaLoaded style={style} onLoaded={() => setSize(index, ref.current.getBoundingClientRect().height)}>
      <div style={style}>
        <Box ref={ref}>
          <Item index={index} {...props} {...rest} />
        </Box>
      </div>
    </OnMediaLoaded>
  )
})

const buildItemData = memoize((setSize, mapper, isItemLoaded, items, parentRef, width, placeholder, props) => (
  {setSize, mapper, isItemLoaded, items, parentRef, width, placeholder, ...props}
))

export default function SmoothScroller({
  hasNextPage, scrollTo, placeholder, loading, items, loadNextPage, mapper, listRef, setListRef, handleScroll, ...props}) {
  const sizeMap = useRef({});
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef && listRef.resetAfterIndex(index)
  }, [listRef]);
  const getSize = useCallback(index => sizeMap.current[index] || 50, []);
  const count = items.length
  const itemCount = hasNextPage ? count + 7 : count;
  const loadMoreItems = loading ? () => {} : loadNextPage;
  const isItemLoaded = useCallback(index => !hasNextPage || index < count, [hasNextPage, count])

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
    >
    {({ onItemsRendered, ref }) => (
      <Autosizer>
      {({height, width}) => (
        <VariableSizeList
          reversed
          height={height}
          width={width}
          itemCount={itemCount}
          itemSize={getSize}
          itemData={buildItemData(setSize, mapper, isItemLoaded, items, listRef, width, placeholder, props)}
          align={scrollTo}
          onScroll={({scrollOffset}) => handleScroll(scrollOffset > (height / 2))}
          onItemsRendered={(ctx) => {
            props.onRendered && props.onRendered(ctx)
            onItemsRendered(ctx)
          }}
          ref={(listRef) => {
            setListRef(listRef)
            ref(listRef)
          }}
          {...props}
        >
          {ItemWrapper}
        </VariableSizeList>
      )}
      </Autosizer>
    )}
    </InfiniteLoader>
  )
}