import React from 'react'
import {Box, Text, Anchor, Markdown, Table, TableBody, TableRow, TableCell} from 'grommet'
import Dropdown from '../utils/Dropdown'
import UserListEntry from '../users/UserListEntry'
import Avatar from '../users/Avatar'

function CommandDisplay(props) {
  return (
    <Box direction='row' align='center' pad={{bottom: 'small'}}>
      <Box width='45px' align='center' justify='center'>
        <Avatar user={props.command.bot} />
      </Box>
      <Box>
        <Dropdown align={{right: 'left', top: 'top'}}>
          <Anchor>
            <Text size='small' color={props.color}>/{props.command.name}</Text>
          </Anchor>
          <CommandDetail {...props} />
        </Dropdown>
        <Text size='small'><i>{props.command.description}</i></Text>
      </Box>
    </Box>
  )
}

function CommandDetail(props) {
  return (
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
  )
}

function CommandListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal' overflow='none'>
      <CommandDisplay {...props} />
    </Box>
  )
}

export default CommandListEntry