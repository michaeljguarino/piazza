import React, {useState, useRef} from 'react'
import {ApolloConsumer} from 'react-apollo'
import Avatar from '../users/Avatar'
import UserHandle from '../users/UserHandle'
import {TextInput, Box, Text, Drop} from 'grommet'
import {Emoji} from 'grommet-icons'
import {SEARCH_USERS} from './queries'
import {SEARCH_COMMANDS} from '../commands/queries'
import 'emoji-mart/css/emoji-mart.css'
import data from 'emoji-mart/data/messenger.json'
import { emojiIndex, NimblePicker } from 'emoji-mart'


export function fetchUsers(client, query, callback) {
  if (!query) return

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

function fetchCommands(client, query, callback) {
  if (!query) return

  client.query({
    query: SEARCH_COMMANDS,
    variables: {name: query}
  }).then(({data}) => {
    return data.searchCommands.edges.map(edge => ({
      value: edge.node.name,
      label: commandSuggestion(edge.node)
    }))
  }).then((res) => callback(res))
}

function fetchEmojis(client, query, callback) {
  if (!query) return
  const found =
    emojiIndex.search(query)
      .slice(0, 10)
      .map((emoji) => {
        return {
          value: emoji,
          label: emojiSuggestion(emoji)
        }
      })

  callback(found)
}

function userSuggestion(user) {
  return (
    <Box direction='row' align='center' pad='small'>
      <Avatar user={user} />
      <Box justify='center' width='100%'>
        <UserHandle user={user} />
      </Box>
      <Box width='150px' direction='row' justify='end'>
        <Text size='small'>{user.name}</Text>
      </Box>
    </Box>
  )
}

function commandSuggestion(command) {
  return (
    <Box direction='row' align='center' pad='small'>
      <Text size='small' weight='bold'>/{command.name}</Text>
    </Box>
  )
}

function emojiSuggestion(emoji) {
  return (
    <Box direction='row' align='center' pad='small'>
      <Text size='small'>{emoji.native} {emoji.colons}</Text>
    </Box>
  )
}

const REGEXES=[
  [/@[^\s@]+$/, fetchUsers, (text) => `@${text}`],
  [/^\/[^\s]+$/, fetchCommands, (text) => `/${text} `],
  [/:[^\s]+$/, fetchEmojis, (emoji) => `${emoji.native} `],
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
      fetcher(client, matches[0].substring(1), (sugs) => (
        setSuggestions({suggestions: sugs, regex: regex, transformer: transformer})
      ))
      return
    }
  }
  setSuggestions(DEFAULT_SUGGESTIONS_STATE)
  return
}

function replaceText(selection, text, regex, transformer) {
  return text.replace(regex, transformer(selection))
}

function EmojiTarget(props) {
  const [hover, setHover] = useState(false)

  return (
    <Box
      align='center'
      justify='center'
      ref={props.emojiRef}
      width='40px'
      onClick={() => props.setEmojiPicker(true)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{cursor: 'pointer'}}>
      <Emoji size='25px' color={hover ? 'accent-1' : 'dark-6'} />
    </Box>
  )
}

function MentionManager(props) {
  const dropRef = useRef()
  const emojiRef = useRef()
  const [suggestionState, setSuggestionState] = useState(DEFAULT_SUGGESTIONS_STATE)
  const [emojiPicker, setEmojiPicker] = useState(false)

  return (
    <ApolloConsumer>
    {client => (
      <>
        <TextInput
          ref={dropRef}
          plain
          dropTarget={dropRef.current}
          value={props.text}
          suggestions={suggestionState.suggestions}
          onSelect={(event) => {
            let selection = event.suggestion.value
            let result = replaceText(selection, props.text, suggestionState.regex, suggestionState.transformer)
            props.setText(result)
            props.onChange(result)
          }}
          onChange={e => {
            const text = e.target.value
            props.setText(text)
            validateRegexes(client, text, setSuggestionState)
            props.onChange(text)
          }}
          placeholder="Whatever is on your mind"
        />
        <EmojiTarget emojiRef={emojiRef} setEmojiPicker={setEmojiPicker} />
        {emojiPicker && (
          <Drop
            align={{ bottom: "top"}}
            target={emojiRef.current}
            onClickOutside={() => setEmojiPicker(false)}
            onEsc={() => setEmojiPicker(false)}
          >
            <NimblePicker
              data={data}
              onSelect={(emoji) => {
                props.setText(props.text + ' ' + emoji.native)
              }} />
          </Drop>
        )}
      </>
    )}
    </ApolloConsumer>
  )
}

export default MentionManager