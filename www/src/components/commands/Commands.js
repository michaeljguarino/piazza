import React from 'react'
import {Box, Text} from 'grommet'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import CommandListEntry from './CommandListEntry'
import Scroller from '../utils/Scroller'

const COMMANDS_Q=gql`
query Commands($cursor: String) {
  commands(first: 15, after: $cursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        name
        documentation
        bot {
          id
          name
          handle
          bot
        }
        webhook {
          url
        }
      }
    }
  }
}
`;
function Commands(props) {
  return (
    <Box pad={props.pad}>
      <Text size='small' margin={{bottom: 'xsmall'}} weight='bold' color={props.color}>Commands</Text>
      <Query query={COMMANDS_Q}>
        {({loading, data, fetchMore}) => {
          if (loading) return '...'
          let commandEdges = data.commands.edges
          let pageInfo = data.commands.pageInfo
          return (
            <Scroller
              id='message-viewport'
              edges={commandEdges}
              style={{
                overflow: 'auto',
                height: '20vh'
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
          )
        }}
      </Query>
    </Box>
  )
}

export default Commands