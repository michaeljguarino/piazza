import React from 'react'
import {Box} from 'grommet'
import {User} from 'grommet-icons'
import { Query } from 'react-apollo'
import Scroller from '../utils/Scroller'
import Flyout, {FlyoutHeader, FlyoutContainer} from '../utils/Flyout'
import HoveredBackground from '../utils/HoveredBackground'
import UserListEntry from './UserListEntry'
import {mergeAppend} from '../../utils/array'
import {USERS_Q, USER_SUB} from './queries'
import {updateUser, addUser} from './utils'
import SubscriptionWrapper from '../utils/SubscriptionWrapper'
import {ICON_HEIGHT, ICON_SPREAD} from '../Piazza'

export function UserIcon(props) {
  return (
    <HoveredBackground>
      <Box
        accentable
        style={{cursor: 'pointer'}}
        margin={{horizontal: ICON_SPREAD}}
        align='center'
        justify='center'>
        <Flyout target={<User size={ICON_HEIGHT} />}>
        {setOpen => (
          <FlyoutContainer>
            <FlyoutHeader text='Users' setOpen={setOpen} />
            <Users width='30vw' pad={{horizontal: 'small', vertical: 'xsmall'}} ignore={new Set()} />
          </FlyoutContainer>
        )}
        </Flyout>
      </Box>
    </HoveredBackground>
  )
}

function _subscribeToMore(subscribeToMore) {
  return subscribeToMore({
    document: USER_SUB,
    updateQuery: (prev, {subscriptionData}) => {
      if (!subscriptionData.data) return prev
      const {payload, delta}  = subscriptionData.data.userDelta

      switch (delta) {
        case "UPDATE":
          return updateUser(prev, payload)
        case "CREATE":
          return addUser(prev, payload)
        default:
          return prev
      }
    }
  })
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
            <SubscriptionWrapper
              id="users"
              startSubscription={() => _subscribeToMore(subscribeToMore)}>
            <Scroller
              id='message-viewport'
              edges={userEdges.filter(({node}) => !props.ignore.has(node.id))}
              style={{
                overflow: 'auto',
                height: '100%'
              }}
              mapper={({node}) => (
                <UserListEntry
                  noFlyout={props.noFlyout}
                  pad={props.pad}
                  onChat={props.onChat}
                  key={node.id}
                  user={node}
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
            </SubscriptionWrapper>
          )
        }}
      </Query>
    </Box>
  )
}

export default Users