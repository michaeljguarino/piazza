import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, TextInput, Text, CheckBox } from 'grommet'
import { ModalHeader } from '../utils/Modal'
import { useQuery, useMutation } from 'react-apollo'
import { USERS_Q, UPDATE_USER, TOGGLE_ACTIVE } from '../users/queries'
import { SEARCH_USERS } from '../messages/queries'
import Loading from '../utils/Loading'
import Scroller from '../utils/Scroller'
import { mergeAppend } from '../../utils/array'
import Avatar from '../users/Avatar'

function ToggleAdmin({id, roles}) {
  const admin = roles && roles.admin
  const [mutation] = useMutation(UPDATE_USER)

  return (
    <CheckBox
      toggle
      checked={admin}
      label='admin'
      onChange={({target: {checked}}) => mutation({
        variables: {id, attributes: {roles: {admin: checked}}}
      })} />
  )
}

function ToggleActive({user: {deletedAt, id}}) {
  const [mutation] = useMutation(TOGGLE_ACTIVE, {
    variables: {id}
  })

  return (
    <CheckBox
      toggle
      checked={!deletedAt}
      label='active'
      onChange={({target: {checked}}) => mutation({variables: {active: checked}})} />
  )
}

function UserRow({user, next}) {
  return (
    <Box direction='row' pad='small' border={next.node ? 'bottom' : null}>
      <Box fill='horizontal' direction='row' gap='small'>
        <Avatar user={user} />
        <Box gap='xsmall'>
          <Text size='small' weight='bold'>{user.handle}</Text>
          <Text size='small' color='dark-3'>{user.email} -- {user.name}</Text>
        </Box>
      </Box>
      <Box pad={{horizontal: 'small'}} width='250px' align='end' gap='xsmall' justify='center'>
        <ToggleAdmin user={user} />
        <ToggleActive user={user} />
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

function DirectoryContent({loading, data, fetchMore}) {
  if (loading) return (<Box height='100%' width='100%'><Loading /></Box>)
  const {edges, pageInfo} = data.users || data.searchUsers

  return (
    <Scroller
      id='directory'
      style={{overflow: 'auto', height: '100%'}}
      edges={edges}
      mapper={({node}, next) => <UserRow key={node.id} user={node} next={next} />}
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
  const [active, setActive] = useState(true)
  const query = search.length > 0 ? SEARCH_USERS : USERS_Q
  const {data, loading, fetchMore} = useQuery(query, {
    variables: search.length > 0 ? {name: search, active} : {active}
  })

  return (
    <Box height='100vh'>
      <ModalHeader big text='Directory' setOpen={() => history.push('/')} />
      <Box pad={{horizontal: 'medium', vertical: 'small'}} gap='small' height='100%'>
        <Box direction='row' fill='horizontal' align='center' border='bottom' pad='small'>
          <Box fill='horizontal'>
            <Text weight='bold'>Users</Text>
          </Box>
          <Box direction='row' width='40vw' gap='small'>
            <CheckBox
              toggle
              checked={!active}
              label={active ? 'only active' : 'all'}
              onChange={({target: {checked}}) => setActive(!checked)} />
            <TextInput
              name='search'
              value={search}
              placeholder='refine by email/handle'
              onChange={({target: {value}}) => setSearch(value)} />
          </Box>
        </Box>
        <Box style={{maxHeight: '80vh', minWidth: '60vw'}} height='100%'>
          <DirectoryContent
            loading={loading}
            data={data}
            fetchMore={fetchMore} />
        </Box>
      </Box>
    </Box>
  )
}