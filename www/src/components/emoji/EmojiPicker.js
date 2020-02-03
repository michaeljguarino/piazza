import React from 'react'
import { useQuery } from 'react-apollo'
import 'emoji-mart/css/emoji-mart.css'
import emojiData from 'emoji-mart/data/messenger.json'
import { NimblePicker } from 'emoji-mart'
import { EMOJI_Q } from './queries'
import { toEmojiPicker } from './utils'

function SafeNimblePicker({emoji, ...rest}) {
  if (!emoji || emoji.length === 0) {
    return (
      <NimblePicker data={emojiData} {...rest} />
    )
  }

  return (
    <NimblePicker
      data={emojiData}
      custom={emoji.map(({node}) => toEmojiPicker(node))}
      {...rest} />
  )
}

export default function EmojiPicker(props) {
  const {loading, data} = useQuery(EMOJI_Q)

  if (loading) return <SafeNimblePicker {...props} />
  const emoji = data.emoji.edges
  return (<SafeNimblePicker emoji={emoji} {...props} />)
}