import React from 'react'
import {Box} from 'grommet'
import {User} from 'grommet-icons'
import { Query } from 'react-apollo'
import Scroller from '../utils/Scroller'
import Flyout, {FlyoutHeader} from '../utils/Flyout'
import HoveredBackground from '../utils/HoveredBackground'
import UserListEntry from './UserListEntry'
import {mergeAppend} from '../../utils/array'
import {USERS_Q} from './queries'

export function UserIcon(props) {
  return (
    <HoveredBackground>
      <Box
        accentable
        style={{cursor: 'pointer'}}
        margin={{horizontal: '10px'}}
        align='center'
        justify='center'>
        <Flyout target={<User size='25px' />}>
        {setOpen => (
          <Box>
            <FlyoutHeader text='Users' setOpen={setOpen} />
            <Users width='30vw' pad={{horizontal: 'small', vertical: 'xsmall'}} ignore={new Set()} />
          </Box>
        )}
        </Flyout>
      </Box>
    </HoveredBackground>
  )
}

function Users(props) {
  return (
    <Box width={props.width}>
      <Query query={USERS_Q}>
        {({loading, data, fetchMore, subscribeToMore}) => {
          if (loading) return '...'
          let userEdges = data.users.edges
          let pageInfo = data.users.pageInfo
          return (
            <Scroller
              id='user-viewport'
              edges={userEdges.filter(({node}) => !props.ignore.has(node.id))}
              style={{
                overflow: 'auto',
                height: '100%'
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