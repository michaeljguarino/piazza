import React from 'react'
import {Box} from 'grommet'
import {Code} from 'grommet-icons'
import { Query } from 'react-apollo'
import CommandListEntry from './CommandListEntry'
import Scroller from '../utils/Scroller'
import {COMMANDS_Q} from './queries'
import Dropdown from '../utils/Dropdown'

function Commands(props) {
  return (
    <Box width='50px' style={{cursor: 'pointer'}} align='center' justify='center'>
      <Dropdown>
        <Code size='25px' />
        <Box width='100px' pad='small'>
          <Query query={COMMANDS_Q}>
          {({loading, data, fetchMore}) => {
            if (loading) return null
            let commandEdges = data.commands.edges
            let pageInfo = data.commands.pageInfo
            return (
              <Scroller
                id='message-viewport'
                edges={commandEdges}
                style={{
                  overflow: 'auto',
                  maxHeight: '150px'
                }}
                mapper={(edge) => <CommandListEntry key={edge.node.id} command={edge.node} color={props.color} />}
                onLoadMore={() => {
                  if (!pageInfo.hasNextPage) {
                    return
                  }
                  fetchMore({
                    variables: {cursor: pageInfo.endCursor},
                    updateQuery: (prev, {fetchMoreResult}) => {
                      const edges = fetchMoreResult.commands.edges
                      const pageInfo = fetchMoreResult.commands.pageInfo
                      if (commandEdges.find((edge) => edge.node.id === edges[0].node.id)) {
                        return prev;
                      }
                      return edges.length ? {
                        commands: {
                          ...prev,
                          edges: [...prev.commands.edges, ...edges],
                          pageInfo
                        }
                      } : prev;
                    }
                  })
                }}
              />
            )}}
          </Query>
        </Box>
      </Dropdown>
    </Box>
  )
}

export default Commands