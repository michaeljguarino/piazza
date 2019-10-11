import React, {useState, useRef} from 'react'
import {useApolloClient, useQuery} from 'react-apollo'
import {TextInput, Box, Text} from 'grommet'
import {Return} from 'grommet-icons'
import {Search} from 'grommet-icons'
import {CONVERSATIONS_Q, SEARCH_Q, PUBLIC_CONVERSATIONS} from './queries'
import {addConversation} from './utils'
import Scroller from '../utils/Scroller'
import {mergeAppend} from '../../utils/array'
import moment from 'moment'

function _addConversation(client, conversation) {
  const prev = client.readQuery({ query: CONVERSATIONS_Q });
  client.writeQuery({
    query: CONVERSATIONS_Q,
    data: addConversation(prev, conversation)
  });
}

export function searchConversations(client, query, callback) {
  if (query.length === 0) return

  client.query({
    query: SEARCH_Q,
    variables: {q: query}
  }).then(({data}) => {
    return data.searchConversations.edges.map((e) => {
      return {value: e.node, label: <ConversationResult name={e.node.name} />}
    })
  }).then(callback)
}

function ConversationResult(props) {
  return (
    <Box direction="row" align="center" gap="small" pad="small">
      <Text size='small'># {props.name}</Text>
    </Box>
  )
}

function ConversationRow(props) {
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
      onClick={() => props.setCurrentConversation(props.conversation)}>
      <Box width='100%'>
        <Box width='100%' gap='xsmall' direction='row' align='center'>
          <Text size='small' style={{fontWeight: 500}}># {props.conversation.name}</Text>
          <Text size='small'>- <i>{props.conversation.topic || 'someone should have written a topic'}</i></Text>
        </Box>
        <Box direction='row'>
          <Text size='xsmall' color='dark-4'>
            Created by {props.conversation.creator.name} {moment(props.conversation.insertedAt).fromNow()}
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
  const edges = fetchMoreResult.conversations.edges
  const pageInfo = fetchMoreResult.conversations.pageInfo

  return edges.length ? {
    ...prev,
    conversations: {
      ...prev.conversations,
      pageInfo,
      edges: mergeAppend(edges, prev.conversations.edges, (e) => e.node.id),
    }
  } : prev;
}


function ConversationSearch(props) {
  const client = useApolloClient()
  const searchRef = useRef()
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const {loading, data, fetchMore} = useQuery(PUBLIC_CONVERSATIONS)

  const wrappedSetCurrentConv = (conv) => {
    _addConversation(client, conv)
    props.setCurrentConversation(conv)
    props.onSearchClose()
  }

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
          onSelect={(e) => {
            wrappedSetCurrentConv(e.selection.value)
            setValue('')
            setSuggestions([])
            props.onSearchClose()
          }}
          value={value}
          onChange={(event) => {
            const q = event.target.value
            setValue(q)
            searchConversations(client, q, setSuggestions)
          }}
        />
      </Box>
      <Box>
      {!loading && (
        <Scroller
          id='conversations-selector'
          style={{
            overflow: 'auto',
            maxHeight: '40vh'
          }}
          edges={data.conversations.edges}
          onLoadMore={() => {
            const {pageInfo} = data.conversations
            if (!pageInfo.hasNextPage) return

            fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: onFetchMore})
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

export default ConversationSearch