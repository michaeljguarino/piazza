import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Box } from 'grommet'
import InfiniteLoader from 'react-window-infinite-loader'
import { VariableSizeList } from 'react-window-reversed'
import Autosizer from 'react-virtualized-auto-sizer'
import memoize from 'memoize-one'
import { CellMeasurer } from './CellMeasurer'

export const ScrollContext = React.createContext({setSize: () => null})

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

const Item = ({ index, mapper, isItemLoaded, placeholder, items, setSize }) => {
  if (!isItemLoaded(index)) {
    return placeholder && placeholder(index)
  }

  return mapper(items[index], items[index + 1] || {}, {setSize});
};

const ItemWrapper = React.memo(({data: {setSize, width, refreshKey, items, isItemLoaded, placeholder, mapper}, style, index}) => {
  const [rowRef, setRowRef] = useState(null)
  const item = items[index]

  const sizeCallback = useCallback(() => {
    rowRef && setSize(index, rowRef.getBoundingClientRect().height)
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowRef, index])

  useEffect(() => {
    sizeCallback()
  }, [sizeCallback, width, item, index]);

  return (
    <CellMeasurer refreshKey={refreshKey} index={index} setSize={setSize}>
      {({registerChild}) => (
        <div style={style}>
          <Box classNames={refreshKey} ref={(ref) => {
              registerChild(ref)
              setRowRef(ref)
          }} margin={index === 0 ? {bottom: 'small'} : null}>
            <Item
              index={index}
              items={items}
              setSize={sizeCallback}
              isItemLoaded={isItemLoaded}
              placeholder={placeholder}
              mapper={mapper} />
            {/* <ResizeObserver onResize={({height}) => setSize(index, height)} /> */}
          </Box>
        </div>
      )}
    </CellMeasurer>
  )
}, areEqual)

const buildItemData = memoize((setSize, mapper, isItemLoaded, items, parentRef, width, placeholder, refreshKey, props) => (
  {setSize, mapper, isItemLoaded, items, parentRef, width, placeholder, refreshKey, ...props}
))

export default function SmoothScroller({
  hasNextPage, scrollTo, placeholder, loading, items, loadNextPage, mapper, listRef, setListRef, handleScroll, refreshKey, keyFn, ...props}) {
  const sizeMap = useRef({});
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef && listRef.resetAfterIndex(index, true)
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef]);
  const getSize = useCallback(index => sizeMap.current[index] || 50, []);
  const count = items.length
  const itemCount = hasNextPage ? count + 7 : count;
  const loadMoreItems = loading ? () => {} : loadNextPage;
  const isItemLoaded = useCallback(index => !hasNextPage || index < count, [hasNextPage, count])
  const itemKey = keyFn ? (index) => (index < count ? keyFn(items[index]) : index) : (index) => index

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      minimumBatchSize={50}
      threshold={75}
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
          itemKey={(index) => `${refreshKey}:${itemKey(index)}`}
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