import React from 'react'
import { Box, Text } from 'grommet'

export default function BotIcon({color, margin}) {
  return (
    <Box
      pad='xxsmall'
      margin={margin}
      round='xxsmall'
      background={color || 'light-4'}>
      <Text size='10px'>BOT</Text>
    </Box>
  )
}