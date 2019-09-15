import React, {Component, useState, useRef} from 'react'
import {ApolloConsumer} from 'react-apollo'
import Avatar from '../users/Avatar'
import UserHandle from '../users/UserHandle'
import {Box, Text, Drop} from 'grommet'
import {Emoji} from 'grommet-icons'
import {SEARCH_USERS} from './queries'
import {SEARCH_COMMANDS} from '../commands/queries'
import {EMOJI_Q} from '../emoji/queries'
import HoveredBackground from '../utils/HoveredBackground'
import EmojiPicker from '../emoji/EmojiPicker'
import { emojiIndex } from 'emoji-mart'
import { Editor } from 'slate-react'
import Plain from 'slate-plain-serializer'
import SuggestionsPlugin from 'slate-smart-suggestions'
import './MentionManager.css'

export function fetchUsers(client, query) {
  if (!query) return

  return client.query({
    query: SEARCH_USERS,
    variables: {name: query}})
  .then(({data}) => {
    return data.searchUsers.edges.map(edge => ({
      key: edge.node.handle,
      value: edge.node.handle,
      suggestion: userSuggestion(edge.node)
    }))
  })
}

function fetchCommands(client, query) {
  if (!query) return

  return client.query({
    query: SEARCH_COMMANDS,
    variables: {name: query}
  }).then(({data}) => {
    return data.searchCommands.edges.map(edge => ({
      value: edge.node.name,
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
        value: `:${node.name}:`,
        suggestion: customEmojiSuggestion(node)
      }))
    const defaultEmoji = emojiIndex
      .search(query)
      .slice(0, 5)
      .map((emoji) => ({
        key: emoji.colons,
        value: emoji.native,
        suggestion: emojiSuggestion(emoji)
      }))
    return [...customEmoji, ...defaultEmoji]
  })
}

export function userSuggestion(user) {
  return (
    <Box direction='row' align='center' pad='xsmall' gap='xsmall'>
      <Avatar user={user} />
      <Box justify='center' width='100%'>
        <UserHandle user={user} />
      </Box>
      <Box direction='row' justify='end'>
        <Text size='small'>{user.name}</Text>
      </Box>
    </Box>
  )
}

function commandSuggestion(command) {
  return (
    <Box direction='row' align='center' pad='xsmall'>
      <Text size='xsmall' weight='bold'>/{command.name}</Text>
    </Box>
  )
}

function customEmojiSuggestion(emoji) {
  return (
    <Box direction='row' align='center' pad='xsmall'>
      <img width='15px' height='15px' alt={emoji.name} src={emoji.imageUrl} />
      <Text size='xsmall'>:{emoji.name}:</Text>
    </Box>
  )
}

function emojiSuggestion(emoji) {
  return (
    <Box direction='row' align='center' pad='xsmall'>
      <Text size='xsmall'>{emoji.native} {emoji.colons}</Text>
    </Box>
  )
}

function EmojiTarget(props) {
  return (
    <HoveredBackground>
      <Box
        accentable
        align='center'
        justify='center'
        ref={props.emojiRef}
        width='40px'
        onClick={() => props.setEmojiPicker(true)}
        style={{cursor: 'pointer'}}>
        <Emoji size='25px' color='dark-6' />
      </Box>
    </HoveredBackground>
  )
}

function getCurrentWord(text, index, initialIndex) {
  if (index === initialIndex) {
    return { start: getCurrentWord(text, index - 1, initialIndex), end: getCurrentWord(text, index + 1, initialIndex) }
  }
  if (text[index] === " " || text[index] === "@" || text[index] === undefined) {
    return index
  }
  if (index < initialIndex) {
    return getCurrentWord(text, index - 1, initialIndex)
  }
  if (index > initialIndex) {
    return getCurrentWord(text, index + 1, initialIndex)
  }
}

function replaceSuggestion(suggestion, change, prefix='') {
  const { anchorText, selection } = change.value
  const { offset } = selection.anchor

  const text = anchorText.text

  let index = { start: offset - 1, end: offset }

  if (text[offset - 1] !== "@") {
    index = getCurrentWord(text, offset - 1, offset - 1)
  }

  const newText = `${text.substring(0, index.start)}${prefix}${suggestion.value} `

  change
    .deleteBackward(offset)
    .insertText(newText)
    .focus()
    .moveToEndOfText()

  return false;
}

class PluggableMentionManager extends Component {
  constructor(props) {
    super(props)
    this.mentionPlugin = new SuggestionsPlugin({
      trigger: '@',
      capture: /@[\w]+/,
      suggestions: (text) => fetchUsers(props.client, text),
      onEnter: (suggestion, change) => {
        replaceSuggestion(suggestion, change, '@')
      }
    })
    this.commandPlugin = new SuggestionsPlugin({
      trigger: '@',
      capture: /^\/[^\s]+/,
      suggestions: (text) => fetchCommands(props.client, text),
      onEnter: (suggestion, change) => {
        replaceSuggestion(suggestion, change, '/')
      }
    })
    this.emojiPlugin = new SuggestionsPlugin({
      trigger: ':',
      capture: /:[^\s]+/,
      suggestions: (text) => fetchEmojis(props.client, text),
      onEnter: (suggestion, change) => {
        replaceSuggestion(suggestion, change, ' ')
      }
    })
  }

  render() {
    return this.props.children([this.mentionPlugin, this.commandPlugin, this.emojiPlugin])
  }
}

function MentionManager(props) {
  const emojiRef = useRef()
  const editorRef = useRef()
  const [emojiPicker, setEmojiPicker] = useState(false)
  const [editorState, setEditorState] = useState(Plain.deserialize(props.text))
  return (
    <ApolloConsumer>
    {client => (
      <PluggableMentionManager client={client} disableSubmit={props.disableSubmit}>
        {(plugins) => (
          <>
          <Editor
            ref={editorRef}
            defaultValue={Plain.deserialize(props.text)}
            value={editorState}
            plugins={plugins}
            style={{
              overflow: 'auto',
              fontFamily: 'Roboto',
              fontSize: '14px',
              width: '100%',
              maxHeight: '160px',
              paddingLeft: '10px',
              paddingTop: '3px',
              paddingBottom: '3px'
            }}
            onKeyDown={(e, editor, next) => {
              if (e.key === 'Enter' && !e.shiftKey && !props.submitDisabled) {
                setEditorState(Plain.deserialize(''))
                // e.preventDefault()
                return
              }
              return next()
            }}
            onChange={state => {
              let text = Plain.serialize(state.value)
              setEditorState(state.value)
              props.setText(text)
              props.onChange(state)
              props.disableSubmit(false)
            }}
            placeholder="this is for talking"
          />
          {plugins.map((plugin, index) => {
            const SuggestionPortal = plugin.SuggestionPortal
            return (
              <SuggestionPortal
                alignTop
                key={index}
                value={editorState}
                onOpen={() => props.disableSubmit(true)}
                onClose={() => props.disableSubmit(false)}
              />
            )
          })}
          <EmojiTarget emojiRef={emojiRef} setEmojiPicker={setEmojiPicker} />
          {emojiPicker && (
            <Drop
              align={{ bottom: "top"}}
              target={emojiRef.current}
              onClickOutside={() => setEmojiPicker(false)}
              onEsc={() => setEmojiPicker(false)}
            >
              <EmojiPicker onSelect={(emoji) => {
                  let text = Plain.serialize(editorState)
                  text += ' ' + (emoji.native ? emoji.native : `:${emoji.short_names[0]}:`)
                  props.setText(text)
                  setEditorState(Plain.deserialize(text))
                }} />
            </Drop>
          )}
        </>
        )}
      </PluggableMentionManager>
      )}
    </ApolloConsumer>
  )
}

export default MentionManager