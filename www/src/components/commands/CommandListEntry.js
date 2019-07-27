import React from 'react'
import {Box, Text, Anchor} from 'grommet'

function CommandListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal'>
      <Anchor>
        <Text size='small' color={props.color}>/{props.command.name}</Text>
      </Anchor>
    </Box>
  )
}

export default CommandListEntry