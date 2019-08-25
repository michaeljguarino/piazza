import React from 'react'
import {Box} from 'grommet'
import { Query } from 'react-apollo'
import Scroller from '../utils/Scroller'
import UserListEntry from './UserListEntry'
import {mergeAppend} from '../../utils/array'
import {USERS_Q} from './queries'

function Users(props) {
  return (
    <Box>
      <Query query={USERS_Q}>
        {({loading, data, fetchMore}) => {
          if (loading) return '...'
          let userEdges = data.users.edges
          let pageInfo = data.users.pageInfo
          return (
            <Scroller
              id='message-viewport'
              edges={userEdges.filter(({node}) => !props.ignore.has(node.id))}
              style={{
                overflow: 'auto',
                height: '40vh'
              }}
              mapper={(edge) => (
                <UserListEntry
                  pad={props.pad}
                  onChat={props.onChat}
                  key={edge.node.id}
                  user={edge.node}
                  color={props.color}
                  onClick={props.onClick} />
              )}
              onLoadMore={() => {
                if (!pageInfo.hasNextPage) {
                  return
                }
                fetchMore({
                  variables: {cursor: pageInfo.endCursor},
                  updateQuery: (prev, {fetchMoreResult}) => {
                    const edges = fetchMoreResult.users.edges
                    const pageInfo = fetchMoreResult.users.pageInfo

                    return edges.length ? {
                      ...prev,
                      users: {
                        ...prev.users,
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