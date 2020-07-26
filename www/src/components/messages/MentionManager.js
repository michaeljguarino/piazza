import React, { useState, useRef } from 'react'
import { useApolloClient } from 'react-apollo'
import { HoveredBackground } from 'forge-core'
import Avatar from '../users/Avatar'
import UserHandle from '../users/UserHandle'
import { Box, Text, Drop } from 'grommet'
import { Emoji } from 'grommet-icons'
import { SEARCH_USERS } from './queries'
import { SEARCH_COMMANDS } from '../commands/queries'
import { EMOJI_Q } from '../emoji/queries'
import EmojiPicker from '../emoji/EmojiPicker'
import { emojiIndex } from 'emoji-mart'
import './MentionManager.css'
import TypeaheadEditor from '../utils/TypeaheadEditor'
import { Editor, Transforms } from 'slate'

const BUILTIN_MENTIONS = [
  {mention: "here", explanation: "Notifies all members of the conversation who are currently online"},
  {mention: "all", explanation: "Notifies all participants in the conversation, even if offline"}
]

function findBuiltinMentions(query) {
  return BUILTIN_MENTIONS
    .filter(({mention}) => mention.indexOf(query) >= 0)
    .map(({mention, explanation}) => ({
      key: mention,
      value: mention,
      suggestion: builtinMention(mention, explanation)
    }))
}

export function fetchUsers(client, query) {
  if (!query) return

  return client.query({
    query: SEARCH_USERS,
    variables: {name: query}})
  .then(({data}) => {
    return data.searchUsers.edges.map(edge => ({
      key: edge.node.handle,
      value: `@${edge.node.handle}`,
      suggestion: userSuggestion(edge.node)
    }))
  }).then(userMentions => {
    return findBuiltinMentions(query).concat(userMentions)
  })
}

function fetchCommands(client, query) {
  if (!query) return

  return client.query({
    query: SEARCH_COMMANDS,
    variables: {name: query}
  }).then(({data}) => {
    return data.searchCommands.edges.map(edge => ({
      value: `/${edge.node.name}`,
      key: edge.node.name,
      suggestion: commandSuggestion(edge.node)
    }))
  })
}

function fetchEmojis(client, query) {
  if (!query) return

  return client.query({
    query: EMOJI_Q,
    variables: {name: query}
  }).then(({data}) => {
    const customEmoji = data.emoji.edges
      .filter(({node}) => node.name.indexOf(query) >= 0)
      .slice(0, 5)
      .map(({node}) => ({
        key: node.name,
        value: ` :${node.name}:`,
        suggestion: customEmojiSuggestion(node)
      }))
    const defaultEmoji = emojiIndex
      .search(query)
      .slice(0, 5)
      .map((emoji) => ({
        key: emoji.colons,
        value: ` ${emoji.native}`,
        suggestion: emojiSuggestion(emoji)
      }))
    return [...customEmoji, ...defaultEmoji]
  })
}

export function userSuggestion(user) {
  return (
    <Box direction='row' align='center' pad='xsmall' gap='xsmall' justify='end'>
      <Box style={{minWidth: '200px'}} direction='row'>
        <Avatar user={user} />
        <Box justify='center'>
          <UserHandle user={user} />
        </Box>
      </Box>
      <Box width='100%' direction='row' justify='end'>
        <Text size='small'>{user.name}</Text>
      </Box>
    </Box>
  )
}

function commandSuggestion(command) {
  return (
    <Box direction='row' align='center' pad='xsmall' gap='small'>
      <Box flex={false} width='35px' height='35px' background='brand' align='center' justify='center'>/</Box>
      <Box>
        <Text size='xsmall' weight='bold'>{command.name}</Text>
        <Text size='xsmall'><i>{command.description}</i></Text>
      </Box>
    </Box>
  )
}

function builtinMention(mention, explanation) {
  return (
    <Box direction='row' align='center' pad='xsmall' gap='xsmall'>
      <Text size='xsmall' weight='bold'>@{mention}</Text>
      <Text size='xsmall'>{explanation}</Text>
    </Box>
  )
}

function customEmojiSuggestion(emoji) {
  return (
    <Box direction='row' align='center' pad='xsmall' gap='xsmall'>
      <img width='15px' height='15px' alt={emoji.name} src={emoji.imageUrl} />
      <Text size='xsmall'>:{emoji.name}:</Text>
    </Box>
  )
}

function emojiSuggestion(emoji) {
  return (
    <Box direction='row' align='center' pad='xsmall' gap='xsmall'>
      <Text size='xsmall'>{emoji.native} {emoji.colons}</Text>
    </Box>
  )
}

function EmojiTarget({emojiRef, setEmojiPicker}) {
  return (
    <HoveredBackground>
      <Box
        accentable
        align='center'
        justify='center'
        ref={emojiRef}
        width='40px'
        onClick={() => setEmojiPicker(true)}
        focusIndicator={false}>
        <Emoji size='25px' color='dark-6' />
      </Box>
    </HoveredBackground>
  )
}

const PLUGIN_TEMPLATES = [
  {trigger: /^@(\w+)$/, suggestions: fetchUsers},
  {trigger: /^\/(\w+)$/, begin: true, suggestions: fetchCommands},
  {trigger: /^:(\w+)$/, suggestions: fetchEmojis}
]

const insertEmoji = (editor, emoji) => {
  let at;
  if (editor.selection) {
    at = editor.selection
  } else if (editor.children.length > 0) {
    at = Editor.end(editor, [])
  } else {
    at = [0]
  }
  Transforms.insertText(editor, emoji, {at})
}

function MentionManager({editor, editorState, setEditorState, onChange, disableSubmit}) {
  const [emojiPicker, setEmojiPicker] = useState(false)
  const client    = useApolloClient()
  const emojiRef  = useRef()

  return (
    <>
    <TypeaheadEditor
      value={editorState}
      editor={editor}
      searchQuery={(query, callback) => callback(client, query)}
      onOpen={disableSubmit}
      handlers={PLUGIN_TEMPLATES}
      setValue={state => {
        onChange(state)
        setEditorState(state)
      }}
      style={{
        overflow: 'auto',
        fontFamily: 'Roboto',
        fontSize: '14px',
        width: '100%',
        maxHeight: '160px',
        paddingLeft: '10px',
        paddingTop: '10px',
        paddingBottom: '10px'
      }} />
    <EmojiTarget emojiRef={emojiRef} setEmojiPicker={setEmojiPicker} />
    {emojiPicker && (
      <Drop
        align={{ bottom: "top"}}
        target={emojiRef.current}
        onClickOutside={() => setEmojiPicker(false)}
        onEsc={() => setEmojiPicker(false)}
      >
        <EmojiPicker onSelect={(emoji) => {
          const text = ' ' + (emoji.native ? emoji.native : `:${emoji.short_names[0]}:`)
          insertEmoji(editor, text)
        }} />
      </Drop>
    )}
    </>
  )
}

export default MentionManager