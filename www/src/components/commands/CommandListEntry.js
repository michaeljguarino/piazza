import React from 'react'
import {Box, Text, Anchor, Markdown} from 'grommet'
import Dropdown from '../utils/Dropdown'

function CommandListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal'>
      <Dropdown align={{left: 'right'}}>
        <Anchor>
          <Text size='small' color={props.color}>/{props.command.name}</Text>
        </Anchor>
        <Box pad='small'>
          <Box direction='row' align='center'>
            <Text weight="bold" size='small' margin='5px'>/{props.command.name}</Text>
            <Text size='small'>help</Text>
          </Box>
          <Markdown>{props.command.documentation || 'Someone needs to write their docs'}</Markdown>
        </Box>
      </Dropdown>
    </Box>
  )
}

export default CommandListEntry