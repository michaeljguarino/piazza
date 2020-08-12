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
import { Emoji as NimbleEmoji } from 'emoji-mart'
import { INPUT_HEIGHT } from './MessageInput'
import { Control } from './MessageControls'

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
        value: emojiNode(node),
        suggestion: customEmojiSuggestion(node)
      }))
    const defaultEmoji = emojiIndex
      .search(query)
      .slice(0, 5)
      .map((emoji) => ({
        key: emoji.colons,
        value: emojiNode(emoji),
        suggestion: emojiSuggestion(emoji)
      }))
    return [...customEmoji, ...defaultEmoji]
  })
}

export function userSuggestion(user) {
  return (
    <Box direction='row' align='center' pad='xsmall' gap='xsmall' justify='end'>
      <Box flex={false} direction='row' align='center'>
        <Avatar user={user} />
        <UserHandle user={user} />
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
      <NimbleEmoji set='google' emoji={emoji.short_names[0]} size={18} />
      <Text size='xsmall'>{emoji.colons}</Text>
    </Box>
  )
}

function EmojiTarget({emojiRef, emojiPicker, setEmojiPicker}) {
  return (
    <HoveredBackground>
      <Box accentable ref={emojiRef} flex={false} focusIndicator={false}>
        <Control closed={emojiPicker} tooltip='insert emoji' align='center' justify='center'
          hoverIndicator='light-2' onClick={() => setEmojiPicker(true)} focusIndicator={false}>
          <Emoji size='20px' color='dark-6' />
        </Control>
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
  Transforms.insertNodes(editor, emojiNode(emoji), {at})
  Transforms.move(editor)
}

export const emojiNode = (emoji) => {
  const name = emoji.short_names ? emoji.short_names[0] : emoji.name
  const text = ` :${name}:`
  return {type: 'emoji', children: [{text}], emoji: {...emoji, name}}
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
    <EmojiTarget emojiRef={emojiRef} emojiPicker={emojiPicker} setEmojiPicker={setEmojiPicker} />
    {emojiPicker && (
      <Drop
        align={{ bottom: "top"}}
        target={emojiRef.current}
        onClickOutside={() => setEmojiPicker(false)}
        onEsc={() => setEmojiPicker(false)}
      >
        <EmojiPicker onSelect={(emoji) => insertEmoji(editor, emoji)} />
      </Drop>
    )}
    </>
  )
}

export default MentionManager