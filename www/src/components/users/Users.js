import React from 'react'
import {Box, Text} from 'grommet'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Scroller from '../utils/Scroller'
import UserListEntry from './UserListEntry'
import {mergeAppend} from '../../utils/array'


const USERS_Q=gql`
query Users($cursor: String) {
  users(first: 15, after: $cursor) {
    pageInfo {
      endCursor
      hasNextPage
    }
    edges {
      node {
        id
        name
        handle
        bot
        bio
        avatar
        backgroundColor
      }
    }
  }
}
`;

function Users(props) {
  return (
    <Box pad={props.pad}>
      <Text size='small' margin={{bottom: '5px'}} weight='bold' color={props.color}>Users</Text>
      <Query query={USERS_Q}>
        {({loading, data, fetchMore}) => {
          if (loading) return '...'
          let userEdges = data.users.edges
          let pageInfo = data.users.pageInfo
          return (
            <Scroller
              id='message-viewport'
              edges={userEdges}
              style={{
                overflow: 'auto',
                height: '20vh'
              }}
              mapper={(edge) => <UserListEntry key={edge.node.id} user={edge.node} color={props.color} />}
              onLoadMore={() => {
                if (!pageInfo.hasNextPage) {
                  return
                }
                fetchMore({
                  variables: {cursor: pageInfo.endCursor},
                  updateQuery: (prev, {fetchMoreResult}) => {
                    const edges = fetchMoreResult.users.edges
                    const pageInfo = fetchMoreResult.users.pageInfo
                    if (userEdges.find((edge) => edge.node.id === edges[0].node.id)) {
                      return prev;
                    }
                    return edges.length ? {
                      users: {
                        ...prev,
                        edges: mergeAppend(prev.users.edges, ...edges, (e) => e.node.id),
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

export default Users