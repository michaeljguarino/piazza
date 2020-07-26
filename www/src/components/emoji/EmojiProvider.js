import React from 'react'
import { Box } from 'grommet'
import { Query } from 'react-apollo'
import { Loading } from 'forge-core'
import { EMOJI_Q } from './queries'

export const EmojiContext = React.createContext({})

export default function EmojiProvider({children}) {
  return (
    <Query query={EMOJI_Q}>
    {({loading, data}) => {
      if (loading) return (<Box height='100vh'><Loading/></Box>)
      const emoji = data.emoji.edges
      return (
        <EmojiContext.Provider value={emoji}>
        {children}
        </EmojiContext.Provider>
      )
    }}
    </Query>
  )
}