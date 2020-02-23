import React, { useState, useRef, useContext, useCallback } from 'react'
import { useApolloClient, useQuery } from 'react-apollo'
import { TextInput, Box, Text } from 'grommet'
import { Return, Search } from 'grommet-icons'
import { SEARCH_Q, PUBLIC_CONVERSATIONS } from './queries'
import { addConversation } from './utils'
import Scroller from '../utils/Scroller'
import { mergeAppend } from '../../utils/array'
import moment from 'moment'
import { CONTEXT_Q } from '../login/queries'
import Loading from '../utils/Loading'
import { Conversations } from '../login/MyConversations'

function _addConversation(client, conversation, workspaceId) {
  const prev = client.readQuery({ query: CONTEXT_Q, variables: { workspaceId } });
  client.writeQuery({
    query: CONTEXT_Q,
    variables: { workspaceId },
    data: addConversation(prev, conversation)
  });
}

export function searchConversations(client, query, callback, workspaceId) {
  if (query.length === 0) return

  client.query({
    query: SEARCH_Q,
    variables: {workspaceId, q: query}
  }).then(({data}) => {
    return data.searchConversations.edges.map((e) => {
      return {value: e.node, label: <ConversationResult name={e.node.name} />}
    })
  }).then(callback)
}

function ConversationResult({name}) {
  return (
    <Box direction="row" align="center" gap="small" pad="small">
      <Text size='small'># {name}</Text>
    </Box>
  )
}

function ConversationRow({conversation, setCurrentConversation}) {
  const [hover, setHover] = useState(false)

  return (
    <Box
      direction="row"
      align='center'
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      pad={{vertical: "xsmall", horizontal: 'small'}}
      background={hover ? 'light-2' : null}
      onClick={() => setCurrentConversation(conversation)}>
      <Box width='100%'>
        <Box width='100%' gap='xsmall' direction='row' align='center'>
          <Text size='small' style={{fontWeight: 500}}># {conversation.name} - <i>{conversation.topic || 'someone should have written a topic'}</i></Text>
        </Box>
        <Box direction='row'>
          <Text size='xsmall' color='dark-4'>
            Created by {conversation.creator.name} {moment(conversation.insertedAt).fromNow()}
          </Text>
        </Box>
      </Box>
      <Box width='20px' align='center' justify='center'>
        {hover && <Return size='15px' />}
      </Box>
    </Box>
  )
}

const onFetchMore = (prev, {fetchMoreResult}) => {
  const {edges, pageInfo} = fetchMoreResult.conversations

  return edges.length ? {
    ...prev, conversations: {
      ...prev.conversations,
      pageInfo,
      edges: mergeAppend(edges, prev.conversations.edges, (e) => e.node.id),
    }
  } : prev;
}


export default function ConversationSearch({onSearchClose}) {
  const {workspaceId, setCurrentConversation} = useContext(Conversations)
  const client = useApolloClient()
  const searchRef = useRef()
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const {loading, data, fetchMore} = useQuery(PUBLIC_CONVERSATIONS, {variables: {workspaceId}})

  const wrappedSetCurrentConv = useCallback((conv) => {
    _addConversation(client, conv, workspaceId)
    onSearchClose()
    setCurrentConversation(conv)
  }, [onSearchClose, setCurrentConversation, workspaceId])

  return (
    <Box ref={searchRef} fill='horizontal' width='40vw' gap='small' pad='small'>
      <Box
        direction='row'
        align='center'
        placeholder='search for a conversation'
        round='xsmall'
        pad={{horizontal: 'xsmall'}}
        border>
        <Search size='15px' />
        <TextInput
          type="search"
          plain
          suggestions={suggestions}
          placeholder='search by name'
          onSelect={({selection: {value}}) => {
            wrappedSetCurrentConv(value)
            setValue('')
            setSuggestions([])
            onSearchClose()
          }}
          value={value}
          onChange={({target: {value}}) => {
            setValue(value)
            searchConversations(client, value, setSuggestions, workspaceId)
          }}
        />
      </Box>
      <Box>
      {loading ? <Box height='40vh'><Loading /></Box> : (
        <Scroller
          id='conversations-selector'
          style={{
            overflow: 'auto',
            height: '40vh'
          }}
          edges={data.conversations.edges}
          onLoadMore={() => {
            const {pageInfo} = data.conversations
            pageInfo.hasNextPage && fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: onFetchMore}
            )
          }}
          mapper={({node}) => (
            <ConversationRow
              conversation={node}
              setCurrentConversation={wrappedSetCurrentConv} />
          )} />
      )}
      </Box>
    </Box>
  )
}