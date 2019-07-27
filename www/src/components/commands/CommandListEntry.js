import React from 'react'
import {Box, Text} from 'grommet'

function CommandListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal'>
      <Text size='small' color={props.color}>/{props.command.name}</Text>
    </Box>
  )
}

export default CommandListEntry