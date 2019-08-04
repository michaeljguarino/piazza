import React, {useState, useRef} from 'react'
import {ApolloConsumer} from 'react-apollo'
import Avatar from '../users/Avatar'
import UserHandle from '../users/UserHandle'
import {TextInput, Box, Text} from 'grommet'
import {SEARCH_USERS} from './queries'

function fetchUsers(client, query, callback) {
  if (!query) return
  console.log(query)
  client.query({
    query: SEARCH_USERS,
    variables: {name: query}})
  .then(({data}) => {
    return data.searchUsers.edges.map(edge => ({
      value: edge.node.handle,
      label: userSuggestion(edge.node)
    }))
  })
  .then((res) => callback(res))
}

function userSuggestion(user) {
  return (
    <Box direction='row' align='center' pad='small'>
      <Avatar user={user} />
      <Box justify='center'>
        <UserHandle user={user} />
        <Text size='small'>{user.name}</Text>
      </Box>
    </Box>
  )
}

const REGEXES=[
  [/@[^\s@]+$/, fetchUsers, (text) => `@${text}`]
]

const DEFAULT_SUGGESTIONS_STATE={
  suggestions: [],
  regex: null,
  transformer: (t) => t
}

function validateRegexes(client, text, setSuggestions) {
  for (const [regex, fetcher, transformer] of REGEXES) {
    if (regex.test(text)) {
      const matches = text.match(regex)
      fetcher(client, matches[0].substring(1), (sugs) => setSuggestions({suggestions: sugs, regex: regex, transformer: transformer}))
      return
    }
  }
  setSuggestions(DEFAULT_SUGGESTIONS_STATE)
  return
}

function replaceText(selection, text, regex, transformer) {
  return text.replace(regex, transformer(selection))
}

function MentionManager(props) {
  const dropRef = useRef()
  const [text, setText] = useState(props.text || '')
  const [suggestionState, setSuggestionState] = useState(DEFAULT_SUGGESTIONS_STATE)

  return (
    <ApolloConsumer>
    {client => (
      <TextInput
        ref={dropRef}
        plain
        dropTarget={dropRef.current}
        dropProps={{stretch: false}}
        value={text}
        suggestions={suggestionState.suggestions}
        onSelect={(event) => {
          let selection = event.suggestion.value
          let result = replaceText(selection, text, suggestionState.regex, suggestionState.transformer)
          setText(result)
        }}
        onChange={e => {
          const text = e.target.value
          setText(text)
          validateRegexes(client, text, setSuggestionState)
          props.onChange(text)
        }}
        placeholder="Whatever is on your mind"
      />
    )}
    </ApolloConsumer>
  )
}

export default MentionManager