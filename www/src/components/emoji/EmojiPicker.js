import React from 'react'
import {Query} from 'react-apollo'
import {Box} from 'grommet'
import 'emoji-mart/css/emoji-mart.css'
import emojiData from 'emoji-mart/data/messenger.json'
import { NimblePicker } from 'emoji-mart'
import { EMOJI_Q } from './queries'
import {toEmojiPicker} from './utils'

function SafeNimblePicker(props) {
  const {emoji, ...rest} = props
  if (!emoji || emoji.length === 0) {
    return (
      <NimblePicker data={emojiData} {...rest} />
    )
  }

  return (
    <NimblePicker
      data={emojiData}
      custom={emoji.map(({node}) => toEmojiPicker(node))}
      {...props} />
  )
}

function EmojiPicker(props) {
  return (
    <Box>
      <Query query={EMOJI_Q}>
      {({loading, data}) => {
        if (loading) return null
        const emoji = data.emoji.edges
        return (<SafeNimblePicker emoji={emoji} {...props} />)
      }}
      </Query>
    </Box>
  )
}

export default EmojiPicker