import React from 'react'
import {Query} from 'react-apollo'
import {Box} from 'grommet'
import 'emoji-mart/css/emoji-mart.css'
import emojiData from 'emoji-mart/data/messenger.json'
import { NimblePicker } from 'emoji-mart'
import { EMOJI_Q } from './queries'
import {toEmojiPicker} from './utils'
import EmojiCreator from './EmojiCreator'

function EmojiPicker(props) {
  return (
    <Box width='330px'>
      <Query query={EMOJI_Q}>
      {({loading, data}) => {
        if (loading) return null
        const emoji = data.emoji.edges
        console.log(emoji)
        return (
          <NimblePicker
            title={<EmojiCreator />}
            data={emojiData}
            custom={emoji.map(({node}) => toEmojiPicker(node))}
            {...props} />)
      }}
      </Query>
    </Box>
  )
}

export default EmojiPicker