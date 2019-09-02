import React, {useState} from 'react'
import {Query, Mutation} from 'react-apollo'
import {Box, Text} from 'grommet'
import {THEME_Q, SET_THEME} from '../themes/queries'
import Scroller from '../utils/Scroller'
import {ThemeContext} from '../Theme'
import {mergeAppend} from '../../utils/array'

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
      pad='small'>
      <Text size='small'>{props.theme.name}</Text>
    </Box>
  )
}

function ThemeSelector(props) {
  return (
    <ThemeContext.Consumer>
    {({id}) => (
      <Box width='300px' pad='small'>
        <Box>
          <Text size='small' weight='bold'>Available themes</Text>
        </Box>
        <Mutation mutation={SET_THEME} update={() => window.location.reload(false)}>
        {mutate => (
          <Query query={THEME_Q}>
          {({loading, data, fetchMore}) => {
            if (loading) return (<Box direction='row'>...</Box>)
            let pageInfo = data.themes.pageInfo
            let edges = data.themes.edges

            return (
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
                    onClick={() => mutate({variables: {id: e.node.id}})}
                  />)}
                onLoadMore={() => {
                  if (!pageInfo.hasNextPage) return
                  fetchMore({
                    variables: {cursor: pageInfo.endCursor},
                    updateQuery: (prev, {fetchMoreResult}) => {
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
                  })
                }}
              />)
          }}
          </Query>
        )}
        </Mutation>
      </Box>
    )}
    </ThemeContext.Consumer>
  )
}

export default ThemeSelector

