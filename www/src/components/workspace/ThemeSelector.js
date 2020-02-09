import React, { useState, useContext } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { Box, Text } from 'grommet'
import { THEME_Q, SET_THEME, UPDATE_BRAND } from './queries'
import Scroller from '../utils/Scroller'
import { ThemeContext } from '../Workspace'
import { mergeAppend, chunk } from '../../utils/array'
import { THEME_FIELDS } from './constants'
import Loading from '../utils/Loading'

function ThemeColors({theme}) {
  return (
    <Box direction='row'>
      {THEME_FIELDS.map((field) => (
        <Box key={field} background={theme[field]} width='20px' height='20px' />
      ))}
    </Box>
  )
}

const onFetchMore = (prev, {fetchMoreResult}) => {
  const edges = fetchMoreResult.themes.edges
  const pageInfo = fetchMoreResult.themes.pageInfo

  return edges.length ? {
    ...prev,
    themes: {
      ...prev.themes,
      pageInfo,
      edges: mergeAppend(edges, prev.themes.edges, (e) => e.node.id)
    }
  } : prev;
}


function ThemeChoice({onClick, theme, current}) {
  const [hover, setHover] = useState(false)
  const selected = current === theme.id
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={selected ? null : {cursor: 'pointer'}}
      border={selected ? true : (hover ? {color: 'focus'} : false)}
      onClick={selected ? null : onClick}
      gap='xsmall'
      pad='small'>
      <Text size='small'>{theme.name}</Text>
      <ThemeColors theme={theme} />
    </Box>
  )
}

export default function ThemeSelector({brand}) {
  const {id, brand: {themeId}} = useContext(ThemeContext)
  const {loading, data, fetchMore} = useQuery(THEME_Q)
  const [mutation] = useMutation(brand ? UPDATE_BRAND : SET_THEME, {
    update: () => window.location.reload(false)
  })

  if (loading) return (<Box fill='horizontal' height='40vh'><Loading /></Box>)
  const {pageInfo, edges} = data.themes

  return (
    <Scroller
      id='themes'
      style={{
        overflow: 'auto',
        maxHeight: '70vh'
      }}
      edges={Array.from(chunk(edges, 2))}
      mapper={(chunk) => (
        <Box direction='row' pad='small' gap='small' margin={{vertical: 'xsmall'}}>
        {chunk.map(({node}) => (
          <ThemeChoice
            current={brand ? themeId : id}
            key={node.id}
            theme={node}
            onClick={() => mutation({variables: {id: node.id}})}
            />
        ))}
        </Box>
      )}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: {cursor: pageInfo.endCursor},
        updateQuery: onFetchMore
      })}
    />
  )
}
