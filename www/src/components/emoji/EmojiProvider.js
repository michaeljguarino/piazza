import React from 'react'
import {Box} from 'grommet'
import {Query} from 'react-apollo'
import Loading from '../utils/Loading'
import {EMOJI_Q} from './queries'

export const EmojiContext = React.createContext({})

function EmojiProvider(props) {
  return (
    <Query query={EMOJI_Q}>
    {({loading, data}) => {
      if (loading) return (<Box height='100vh'><Loading/></Box>)
      const emoji = data.emoji.edges
      return (
        <EmojiContext.Provider value={emoji}>
        {props.children}
        </EmojiContext.Provider>
      )
    }}
    </Query>
  )
}

export default EmojiProvider
