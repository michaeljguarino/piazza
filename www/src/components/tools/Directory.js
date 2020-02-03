import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, TextInput, Text, CheckBox } from 'grommet'
import { ModalHeader } from '../utils/Modal'
import { useQuery, useMutation } from 'react-apollo'
import { USERS_Q, UPDATE_USER } from '../users/queries'
import { SEARCH_USERS } from '../messages/queries'
import Loading from '../utils/Loading'
import Scroller from '../utils/Scroller'
import { mergeAppend } from '../../utils/array'
import Avatar from '../users/Avatar'

function UserControls({user, query}) {
  const vars = {id: user.id}
  const admin = user.roles && user.roles.admin
  const [mutation] = useMutation(UPDATE_USER)

  return (
    <CheckBox
      toggle
      checked={admin}
      label='admin'
      onChange={({target: {checked}}) => mutation({variables: {
        ...vars, attributes: {roles: {admin: checked}}
      }})} />
  )
}

function UserRow({user, next, query}) {
  return (
    <Box direction='row' pad='small' border={next.node ? 'bottom' : null}>
      <Box fill='horizontal' direction='row' gap='small'>
        <Avatar user={user} />
        <Box gap='xsmall'>
          <Text size='small' weight='bold'>{user.handle}</Text>
          <Text size='small' color='dark-3'>{user.email} -- {user.name}</Text>
        </Box>
      </Box>
      <Box pad={{horizontal: 'small'}} width='250px' align='end' justify='center'>
        <UserControls user={user} query={query} />
      </Box>
    </Box>
  )
}

const onFetchMore = (prev, {fetchMoreResult}) => {
  const {edges, pageInfo} = fetchMoreResult.users || fetchMoreResult.searchUsers
  const key = fetchMoreResult.users ? 'users' : 'searchUsers'

  return edges.length ? {
    ...prev,
    [key]: {
      ...(prev.users || prev.searchUsers),
      edges: mergeAppend(prev.users.edges, ...edges, (e) => e.node.id),
      pageInfo
    }
  } : prev;
}

function DirectoryContent({loading, data, fetchMore, query}) {
  if (loading) return <Loading />
  const {edges, pageInfo} = data.users || data.searchUsers

  return (
    <Scroller
      id='directory'
      style={{overflow: 'auto', height: '100%'}}
      edges={edges}
      mapper={({node}, next) => <UserRow key={node.id} query={query} user={node} next={next} />}
      onLoadMore={() => {
        if (!pageInfo.hasNextPage) return

        fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: onFetchMore
        })
      }} />
  )
}

export default function Directory() {
  const history = useHistory()
  const [search, setSearch] = useState('')
  const query = search.length > 0 ? SEARCH_USERS : USERS_Q
  const {data, loading, fetchMore} = useQuery(query, {
    variables: search.length > 0 ? {name: search} : {}
  })
  return (
    <Box>
      <ModalHeader big text='Directory' setOpen={() => history.push('/')} />
      <Box pad={{horizontal: 'medium', vertical: 'small'}} gap='small'>
        <Box direction='row' fill='horizontal' align='center' border='bottom' pad='small'>
          <Box fill='horizontal'>
            <Text weight='bold'>Users</Text>
          </Box>
          <Box width='30vw'>
            <TextInput
              name='search'
              value={search}
              placeholder='refine by email/handle'
              onChange={({target: {value}}) => setSearch(value)} />
          </Box>
        </Box>
        <Box style={{maxHeight: '80vh', minWidth: '60vw'}}>
          <DirectoryContent
            loading={loading}
            data={data}
            fetchMore={fetchMore}
            query={query} />
        </Box>
      </Box>
    </Box>
  )
}