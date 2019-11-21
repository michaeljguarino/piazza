import React, {useState, useRef, useCallback, useEffect} from 'react'
import InfiniteLoader from 'react-window-infinite-loader'
import {VariableSizeList} from 'react-window'
import Autosizer from 'react-virtualized-auto-sizer'

const Item = ({ index, style, mapper, parentRef, isItemLoaded, placeholder, items }) => {
  if (!isItemLoaded(index)) {
    return placeholder
  }

  return mapper(items[index], items[index + 1] || {}, style, parentRef);
};

const ItemWrapper = ({setSize, style, index, parentWidth, ...props}) => {
  const ref = useRef()
  useEffect(() => {
    setSize(index, ref.current.getBoundingClientRect().height);
  }, [parentWidth]);

  return <div style={style} ref={ref}>
    <Item style={style} index={index} {...props} />
  </div>
}

export default function SmoothScroller({hasNextPage, parentRef, loading, items, loadNextPage, mapper, placeholder, ...props}) {
  const [listRef, setListRef] = useState(null)
  const sizeMap = useRef({});
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef && listRef.current.resetAfterIndex(index)
  }, []);
  const getSize = useCallback(index => sizeMap.current[index] || 50, []);
  const itemCount = hasNextPage ? items.length + 1 : items.length;
  const loadMoreItems = loading ? () => {} : loadNextPage;
  const isItemLoaded = index => !hasNextPage || index < items.length;

  const ListItem = (props) => ItemWrapper({setSize, parentRef, mapper, isItemLoaded, items, ...props})

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
          height={height}
          width={width}
          itemCount={itemCount}
          itemSize={getSize}
          onItemsRendered={onItemsRendered}
          ref={(listRef) => {
            setListRef(listRef)
            ref(ref)
          }}
          {...props}
        >
          {(props) => <ListItem parentWidth={width} {...props} />}
        </VariableSizeList>
      )}
      </Autosizer>
    )}
    </InfiniteLoader>
  )
}