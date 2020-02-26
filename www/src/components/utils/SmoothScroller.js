import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Box } from 'grommet'
import InfiniteLoader from 'react-window-infinite-loader'
import { VariableSizeList } from 'react-window-reversed'
import Autosizer from 'react-virtualized-auto-sizer'
import OnMediaLoaded from './OnMediaLoaded'
import memoize from 'memoize-one'
import CellMeasurer from './CellMeasurer'
import ResizeObserver from 'react-resize-observer'

function shallowDiffers(prev, next) {
  for (let attribute in prev) {
    if (!(attribute in next)) {
      return true;
    }
  }
  for (let attribute in next) {
    if (prev[attribute] !== next[attribute]) {
      return true;
    }
  }
  return false;
}

function areEqual(prevProps, nextProps) {
  const { style: prevStyle, ...prevRest } = prevProps;
  const { style: nextStyle, ...nextRest } = nextProps;

  return (
    !shallowDiffers(prevStyle, nextStyle) && !shallowDiffers(prevRest, nextRest)
  );
}

const Item = ({ index, mapper, parentRef, isItemLoaded, placeholder, items, style }) => {
  if (!isItemLoaded(index)) {
    return placeholder && placeholder(index)
  }

  return mapper(items[index], items[index + 1] || {}, parentRef, style);
};

const ItemWrapper = React.memo(({data: {setSize, width, refreshKey, items, ...rest}, style, index, ...props}) => {
  const [rowRef, setRowRef] = useState(null)
  const item = items[index]
  useEffect(() => {
    if (!rowRef) return
    const onTimeout = () => setSize(index, rowRef.getBoundingClientRect().height)
    onTimeout()
    const timeouts = [10, 50, 100, 500, 1000].map((timeout) => setTimeout(onTimeout, timeout))
    return () => timeouts.map(clearTimeout)
  }, [rowRef, width, item, index]);

  return (
    <CellMeasurer refreshKey={refreshKey} index={index} setSize={setSize}>
      {({registerChild}) => (
        <OnMediaLoaded refreshKey={item} onLoaded={() => rowRef && setSize(index, rowRef.getBoundingClientRect().height)}>
          <div style={style}>
            <Box classNames={refreshKey} ref={(ref) => {
                registerChild(ref)
                setRowRef(ref)
            }}>
              <Item index={index} items={items} setSize={(size) => setSize(index, size)} {...props} {...rest} />
              {/* <ResizeObserver onResize={({height}) => setSize(index, height)} /> */}
            </Box>
          </div>
        </OnMediaLoaded>
      )}
    </CellMeasurer>
  )
}, areEqual)

const buildItemData = memoize((setSize, mapper, isItemLoaded, items, parentRef, width, placeholder, refreshKey, props) => (
  {setSize, mapper, isItemLoaded, items, parentRef, width, placeholder, refreshKey, ...props}
))

export default function SmoothScroller({
  hasNextPage, scrollTo, placeholder, loading, items, loadNextPage, mapper, listRef, setListRef, handleScroll, refreshKey, ...props}) {
  const sizeMap = useRef({});
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef && listRef.resetAfterIndex(index, true)
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
          itemKey={(index) => `${refreshKey}:${index}`}
          itemData={buildItemData(setSize, mapper, isItemLoaded, items, listRef, width, placeholder, refreshKey, props)}
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