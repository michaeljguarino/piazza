import React from 'react'
import {Box, Text, Anchor, Markdown, Table, TableBody, TableRow, TableCell} from 'grommet'
import Dropdown from '../utils/Dropdown'
import UserListEntry from '../users/UserListEntry'

function CommandListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal' overflow='none'>
      <Dropdown align={{right: 'left', top: 'bottom'}}>
        <Anchor>
          <Text size='small' color={props.color}>/{props.command.name}</Text>
        </Anchor>
        <Box pad='small' width='400px'>
          <Box direction='row' align='center' margin={{bottom: 'small'}}>
            <Text weight="bold" size='small' margin='5px'>/{props.command.name}</Text>
            <Text size='small'>help</Text>
          </Box>
          <Box direction='row' align='center'>
            <Markdown>{props.command.documentation || 'Someone needs to write their docs'}</Markdown>
          </Box>
          <Box border="bottom" direction="row" margin={{top: 'small'}} pad='small'>
            <Text>Attributes</Text>
          </Box>
          <Table caption='Attributes'>
            <TableBody>
              <TableRow>
                <TableCell><strong>Bot User</strong></TableCell>
                <TableCell><UserListEntry user={props.command.bot} /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Webhook Url</strong></TableCell>
                <TableCell>{props.command.webhook.url}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Dropdown>
    </Box>
  )
}

export default CommandListEntry