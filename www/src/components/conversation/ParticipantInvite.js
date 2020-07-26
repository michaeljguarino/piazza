import React, { useState } from 'react'
import { useMutation, useApolloClient } from 'react-apollo'
import { Box } from 'grommet'
import uniqBy from 'lodash/uniqBy'
import { TagInput, Button } from 'forge-core'
import { CREATE_PARTICIPANTS, PARTICIPANTS_Q } from './queries'
import { mergeAppend } from '../../utils/array'
import { SEARCH_USERS } from '../messages/queries'
import { userSuggestion } from '../messages/MentionManager'

function fetchUsers(client, query, callback) {
  if (!query) return

  client.query({
    query: SEARCH_USERS,
    variables: {name: query}})
  .then(({data}) => {
    return data.searchUsers.edges.map(edge => ({
      value: edge.node,
      label: userSuggestion(edge.node)
    }))
  }).then(callback)
}

export function ParticipantInviteButton(props) {
  const [mutation] = useMutation(CREATE_PARTICIPANTS, {
    update: (cache, {data: {createParticipants}}) => {
      const prev = cache.readQuery({query: PARTICIPANTS_Q, variables: {conversationId: props.conversation.id}})
      const edges = prev.conversation.participants.edges
      let newEdges = createParticipants.map((p) => ({node: p, __typename: "ParticipantEdge"}))
      cache.writeQuery({
        query: PARTICIPANTS_Q,
        variables: {conversationId: props.conversation.id},
        data: {
          ...prev,
          conversation: {
            ...prev.conversation,
            participants: {
              ...prev.conversation.participants,
              edges: mergeAppend(edges, newEdges, (e) => e.node.id)
            }
          }
        }
      })
      props.close()
    }
  })

  return (
    <Button
      size='small'
      onClick={() => mutation({
        variables: {
          handles: props.participants,
          conversationId: props.conversation.id
        }
      })}
      margin={{left: 'xsmall'}}
      label='Go'
      height='100%'
      width='50px' />
  )
}


function ParticipantInvite(props) {
  const [state, setState] = useState({value: "", q: "", open: false, participants: [], suggestions: []})
  const client = useApolloClient()

  const setSuggestions = (suggestions) => {
    setState({...state, suggestions: suggestions})
  }

  const clearInput = () => {
    setState({value: "", q: "", open: false, participants: [], suggestions: []})
  }

  const mapper = props.mapper || ((p) => p.handle)
  const additional = props.additional || []
  const allParticipants = uniqBy([...additional, ...state.participants], (u) => u.id)

  return (
    <Box direction={props.direction || 'column'} pad={props.pad || {left: 'small', right: 'small'}}>
      <TagInput
        placeholder="Search for users by handle..."
        round='xsmall'
        suggestions={state.suggestions}
        value={allParticipants.map((u) => u.handle)}
        onRemove={(handle) => {
          props.onRemoveParticipant && props.onRemoveParticipant(handle)
          setState({...state,  participants: state.participants.filter((t) => t.handle !== handle)})
        }}
        onAdd={(u) => {
          props.onAddParticipant && props.onAddParticipant(u.value)
          setState({...state, participants: [...state.participants, u.value], suggestions: []})
        }}
        onChange={({ target: { value } }) => fetchUsers(client, value, setSuggestions)}
        button={props.children(allParticipants.map(mapper), clearInput)}
      />
    </Box>
  )
}

export default ParticipantInvite