import React from 'react'
import { Box } from 'grommet'
import { User } from 'grommet-icons'
import { useQuery } from 'react-apollo'
import Scroller from '../utils/Scroller'
import Flyout, { FlyoutHeader, FlyoutContainer } from '../utils/Flyout'
import HoveredBackground from '../utils/HoveredBackground'
import UserListEntry from './UserListEntry'
import { mergeAppend } from '../../utils/array'
import { USERS_Q, USER_SUB } from './queries'
import { updateUser, addUser } from './utils'
import { ICON_HEIGHT, ICON_SPREAD } from '../Piazza'
import { useSubscription } from '../utils/hooks'
import Loading from '../utils/Loading'

export function UserFlyout({setOpen}) {
  return (
    <FlyoutContainer width='30vw'>
      <FlyoutHeader text='Users' setOpen={setOpen} />
      <Users width='30vw' pad={{horizontal: 'small', vertical: 'xsmall'}} ignore={new Set()} />
    </FlyoutContainer>
  )
}

export function UserIcon() {
  return (
    <HoveredBackground>
      <Box
        accentable
        style={{cursor: 'pointer'}}
        margin={{horizontal: ICON_SPREAD}}
        align='center'
        justify='center'>
        <Flyout target={<User size={ICON_HEIGHT} />}>
        {setOpen => (<UserFlyout setOpen={setOpen} />)}
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

const onFetchMore = (prev, {fetchMoreResult}) => {
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

export default function Users({width, ignore, noFlyout, pad, margin, onChat, color, onClick, showLoading}) {
  const {loading, data, fetchMore, subscribeToMore} = useQuery(USERS_Q)
  useSubscription(() => _subscribeToMore(subscribeToMore), "users")
  if (loading && showLoading) return <Box height='100%'><Loading /></Box>
  if (loading) return '...'
  let userEdges = data.users.edges
  let pageInfo = data.users.pageInfo

  return (
    <Box width={width}>
      <Scroller
        id='message-viewport'
        edges={userEdges.filter(({node}) => !ignore.has(node.id))}
        style={{
          overflow: 'auto',
          height: '100%'
        }}
        mapper={({node}) => (
          <UserListEntry
            noFlyout={noFlyout}
            pad={pad}
            margin={margin}
            onChat={onChat}
            key={node.id}
            user={node}
            color={color}
            onClick={onClick} />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: onFetchMore
        })}
      />
    </Box>
  )
}