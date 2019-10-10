import React, {useState, useRef, useEffect} from 'react'
import {useApolloClient} from 'react-apollo'
import {TextInput, Box, Text} from 'grommet'
import {Search} from 'grommet-icons'
import {SEARCH_Q} from './queries'
import {CONVERSATIONS_Q} from '../conversation/queries'
import {addConversation} from '../conversation/utils'

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
    <Box
      direction="row"
      align="center"
      gap="small"
      pad="small">
      <Text size='small'># {props.name}</Text>
    </Box>
  )
}


function ConversationSearch(props) {
  const client = useApolloClient()
  const searchRef = useRef()
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])

  function handleClickOutside(event) {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      props.onSearchClose()
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const wrappedSetCurrentConv = (e) => {
    const conv = e.suggestion.value
    _addConversation(client, conv)
    props.setCurrentConversation(conv)
  }

  return (
    <Box
      ref={searchRef}
      fill='horizontal'
    >
      <Box
        direction='row'
        align='center'
        placeholder='search for a conversation'
        border='bottom'>
        <Search size='15px' />
        <TextInput
          type="search"
          plain
          suggestions={suggestions}
          onSelect={(conv) => {
            wrappedSetCurrentConv(conv)
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
    </Box>
  )
}

export default ConversationSearch