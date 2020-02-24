import React, {useState, useRef, useCallback, useEffect} from 'react'
import {Box} from 'grommet'
import InfiniteLoader from 'react-window-infinite-loader'
import {VariableSizeList} from 'react-window-reversed'
import Autosizer from 'react-virtualized-auto-sizer'
import OnMediaLoaded from './OnMediaLoaded'

const Item = ({ index, style, mapper, parentRef, isItemLoaded, placeholder, items }) => {
  if (!isItemLoaded(index)) {
    return placeholder && placeholder(index)
  }

  return mapper(items[index], items[index + 1] || {}, parentRef, style);
};

const ItemWrapper = ({setSize, style, index, parentWidth, sizeEstimate, ...props}) => {
  const ref = useRef()
  useEffect(() => {
    if (!ref.current) return

    setSize(index, ref.current.getBoundingClientRect().height);
  }, [ref, parentWidth]);

  return (
    <OnMediaLoaded onLoaded={() => setSize(index, ref.current.getBoundingClientRect().height)}>
      <div style={style}>
        <Box ref={ref}>
          <Item index={index} {...props} />
        </Box>
      </div>
    </OnMediaLoaded>
  )
}

export default function SmoothScroller({
  hasNextPage, scrollTo, placeholder, loading, items, loadNextPage, mapper, listRef, setListRef, ...props}) {
  const sizeMap = useRef({});
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef && listRef.resetAfterIndex(index)
  }, [listRef]);
  const getSize = useCallback(index => sizeMap.current[index] || 50, []);
  const count = items.length
  const itemCount = hasNextPage ? count + 7 : count;
  const loadMoreItems = loading ? () => {} : loadNextPage;
  const isItemLoaded = index => !hasNextPage || index < count
  const ListItem = (props) => ItemWrapper({setSize, mapper, isItemLoaded, items, parentRef: listRef, ...props})

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
          align={scrollTo}
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
          {(props) => <ListItem setSize={setSize} parentWidth={width} placeholder={placeholder} {...props} />}
        </VariableSizeList>
      )}
      </Autosizer>
    )}
    </InfiniteLoader>
  )
}