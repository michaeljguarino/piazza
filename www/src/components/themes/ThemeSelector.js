import React, {useState} from 'react'
import {useMutation, useQuery} from 'react-apollo'
import {Box, Text} from 'grommet'
import {THEME_Q, SET_THEME} from './queries'
import Scroller from '../utils/Scroller'
import {ThemeContext} from '../Theme'
import {mergeAppend} from '../../utils/array'
import {THEME_FIELDS} from './constants'

function ThemeColors(props) {
  return (
    <Box direction='row'>
      {THEME_FIELDS.map((field) => (
        <Box key={field} background={props.theme[field]} width='20px' height='20px' />
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


function ThemeChoice(props) {
  const [hover, setHover] = useState(false)
  const selected = props.current === props.theme.id
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{cursor: 'pointer'}}
      border={selected || hover}
      onClick={props.onClick}
      margin={{vertical: 'xsmall'}}
      gap='xsmall'
      pad='small'>
      <Text size='small'>{props.theme.name}</Text>
      <ThemeColors theme={props.theme} />
    </Box>
  )
}

function ThemeSelector(props) {
  const {loading, data, fetchMore} = useQuery(THEME_Q)
  const [mutation] = useMutation(SET_THEME, {
    update: () => window.location.reload(false)
  })

  if (loading) return (<Box direction='row'>...</Box>)
  let pageInfo = data.themes.pageInfo
  let edges = data.themes.edges
  return (
    <ThemeContext.Consumer>
    {({id}) => (
      <Scroller
        style={{
          overflow: 'auto',
          maxHeight: '70vh',
          display: 'flex',
          justifyContent: 'flex-start',
          flexDirection: 'column',
        }}
        edges={edges}
        mapper={(e) => (
          <ThemeChoice
            current={id}
            key={e.node.id}
            theme={e.node}
            onClick={() => mutation({variables: {id: e.node.id}})}
          />)}
        onLoadMore={() => {
          if (!pageInfo.hasNextPage) return
          fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: onFetchMore
          })
        }}
      />
    )}
    </ThemeContext.Consumer>
  )
}

export default ThemeSelector

