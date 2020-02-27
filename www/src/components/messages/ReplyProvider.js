import React, {useState} from 'react'
import {Box, Stack} from 'grommet'
import {Close} from 'grommet-icons'
import Message from './Message'

export const ReplyContext = React.createContext({
  reply: null,
  setReply: null
})

export function ReplyGutter({reply, setReply, ...props}) {
  const [hover, setHover] = useState(false)
  if (!reply) return null

  return (
    <Box pad='small' border='top'>
      <Box style={{borderLeft: "2px solid gray"}}>
        <Stack anchor='top-right'>
          <Message noHover message={reply} next={{}} {...props} />
          <Box
            width='25px'
            height='25px'
            align='center'
            justify='center'
            style={{cursor: 'pointer'}}
            onClick={() => setReply(null)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            background={hover ? 'light-3' : null}>
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
