import React from 'react'
import {Mutation} from 'react-apollo'
import {Box, Text, Anchor, Markdown, Table, TableBody, TableRow, TableCell} from 'grommet'
import {Edit} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import Avatar from '../users/Avatar'
import { FilePicker } from 'react-file-picker'
import {UPDATE_USER, USERS_Q} from '../users/queries'
import {updateUser} from '../users/utils'
import Modal from '../utils/Modal'
import CommandEditor from './CommandEditor'


function CommandDisplay(props) {
  return (
    <Box direction='row' align='center'>
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

function EditableAvatar(props) {
  return (
    <Mutation
      mutation={UPDATE_USER}
      update={(cache, { data }) => {
        const prev = cache.readQuery({ query: USERS_Q })
        cache.writeQuery({query: USERS_Q, data: updateUser(prev, data.updateUser)})
      }} >
      {mutation => (
        <FilePicker
          extensions={['jpg', 'jpeg', 'png']}
          dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
          onChange={ (file) => mutation({variables: {id: props.user.id, attributes: {avatar: file}}})}
        >
          <span><Avatar {...props} /></span>
        </FilePicker>
      )}
    </Mutation>
  )
}

function BotDisplay(props) {
  return (
    <Box
      style={{cursor: 'pointer'}}
      direction='row'
      align='center'
      pad={props.pad || 'xxsmall'}
      onClick={() => props.onClick && props.onClick(props.user)}
      fill='horizontal'>
      {props.disableEdit ? <Avatar {...props} /> : <EditableAvatar {...props} />}
      <Box>
        <Box>
          <Text size='small' weight='bold'>{"@" + props.user.handle}</Text>
          <Text size='small' color='dark-6'>{props.user.name}</Text>
        </Box>
      </Box>
    </Box>
  )
}

function CommandDetail(props) {
  return (
    <Box pad='small' style={{minWidth: '400px'}}>
      <Box direction='row' align='center'>
        <Box width='100%' direction='row'>
          <Text weight="bold" size='small' margin='5px'>/{props.command.name}</Text>
          <Text size='small' margin={{vertical: '5px'}}>help</Text>
        </Box>
        <Box width='30px'>
          <Modal target={<Edit style={{cursor: 'pointer'}} size='20px' />}>
          {(setOpen) => (<CommandEditor setOpen={setOpen} command={props.command} />)}
          </Modal>
        </Box>
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
            <TableCell><BotDisplay disableEdit={props.disableEdit} user={props.command.bot} /></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Webhook Url</strong></TableCell>
            <TableCell>{props.command.webhook.url}</TableCell>
          </TableRow>
          {props.command.incomingWebhook && (
            <TableRow>
              <TableCell><strong>Incoming Webhook</strong></TableCell>
              <TableCell>{props.command.incomingWebhook.url} ({props.command.incomingWebhook.conversation.name})</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}

function CommandListEntry(props) {
  return (
    <Box direction='row' align='center' fill='horizontal' overflow='none' pad={props.pad}>
      <CommandDisplay {...props} />
    </Box>
  )
}

export default CommandListEntry