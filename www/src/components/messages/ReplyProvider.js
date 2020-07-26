import React, { useState } from 'react'
import { Box, Stack } from 'grommet'
import { Close } from 'grommet-icons'
import Message from './Message'
import { ScrollContext } from '../utils/SmoothScroller'

export const ReplyContext = React.createContext({
  reply: null,
  setReply: null
})

export function ReplyGutter({reply, setReply, ...props}) {
  if (!reply) return null

  return (
    <Box pad='small' border='top'>
      <Box style={{borderLeft: "2px solid gray"}}>
        <Stack anchor='top-right'>
          <ScrollContext.Provider value={{setSize: () => null}}>
            <Message noHover message={reply} next={{}} {...props} />
          </ScrollContext.Provider>
          <Box
            width='25px'
            height='25px'
            align='center'
            justify='center'
            focusIndicator={false}
            hoverIndicator='light-3'
            onClick={() => setReply(null)}>
            <Close size='15px' />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}


export default function ReplyProvider({children}) {
  const [reply, setReply] = useState(null)
  return (
    <ReplyContext.Provider value={{reply, setReply}}>
    {children}
    </ReplyContext.Provider>
  )
}
