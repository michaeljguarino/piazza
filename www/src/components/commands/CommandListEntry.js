import React, {useState, useRef} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Text, Anchor, Markdown, Table, TableBody, TableRow, TableCell, Drop} from 'grommet'
import {Edit} from 'grommet-icons'
import Avatar from '../users/Avatar'
import { FilePicker } from 'react-file-picker'
import {UPDATE_USER, USERS_Q} from '../users/queries'
import {updateUser} from '../users/utils'
import Modal from '../utils/Modal'
import Copyable from '../utils/Copyable'
import CommandEditor from './CommandEditor'


function CommandDisplay(props) {
  const dropRef = useRef()
  const [hover, setHover] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      fill='horizontal'
      direction='row'
      align='center'
      pad={props.pad}
      background={hover ? 'light-hover' : null}>
      <Box width='45px' align='center' justify='center'>
        <Avatar user={props.command.bot} />
      </Box>
      <Box>
        <Box ref={dropRef} direction='row' align='center'>
          <Anchor onClick={() => setDropOpen(true)}>
            <Text size='small' margin={{right: 'xsmall'}} color={props.color}>/{props.command.name}</Text>
          </Anchor>
          {hover && (
            <Box direction='row' animation={{type: 'fadeIn', duration: 200}} >
              <Modal
                target={<Edit style={{cursor: 'pointer'}} size='10px' />}>
              {(setOpen) => (<CommandEditor setOpen={setOpen} command={props.command} />)}
              </Modal>
            </Box>
          )}
        </Box>
        {dropOpen && (
          <Drop
            align={{right: 'left', top: 'top'}}
            margin={{top: '5px'}}
            target={dropRef.current}
            onClickOutside={() => setDropOpen(false)}
            onEsc={() => setDropOpen(false)}
          >
            <CommandDetail {...props} />
          </Drop>
        )}
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
              <TableCell>
                <Box direction='row' align='center'>
                  <Copyable text={props.command.incomingWebhook.url} pillText='incoming webhook copied!' />
                  <Text margin={{left: '5px'}} size='small'>({props.command.incomingWebhook.conversation.name})</Text>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}

function CommandListEntry(props) {
  return (
    <Box direction='row' align='center' overflow='none'>
      <CommandDisplay {...props} />
    </Box>
  )
}

export default CommandListEntry