import React, { useState, useRef } from 'react'
import { Mutation } from 'react-apollo'
import { Box, Text, Anchor, Markdown, Table, TableBody, TableRow, TableCell, Drop } from 'grommet'
import { Edit } from 'grommet-icons'
import Avatar from '../users/Avatar'
import { FilePicker } from 'react-file-picker'
import { UPDATE_USER, USERS_Q } from '../users/queries'
import { Modal, Copyable } from 'forge-core'
import { updateUser } from '../users/utils'
import CommandEditor from './CommandEditor'


function CommandDisplay({disableEdit, pad, command, color}) {
  const dropRef = useRef()
  const [hover, setHover] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const showHover = !disableEdit && hover

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      fill='horizontal'
      direction='row'
      align='center'
      gap='small'
      pad={pad}
      background={showHover ? 'lightHover' : null}>
      <Avatar user={command.bot} rightMargin='0px' />
      <Box>
        <Box ref={dropRef} direction='row' align='center'>
          <Anchor onClick={() => setDropOpen(true)}>
            <Text size='small' margin={{right: 'xsmall'}} color={color || 'black'}>/{command.name}</Text>
          </Anchor>
          {showHover && (
            <Box direction='row' animation={{type: 'fadeIn', duration: 200}} >
              <Modal
                target={<Edit style={{cursor: 'pointer'}} size='10px' />}>
              {(setOpen) => (<CommandEditor setOpen={setOpen} command={command} />)}
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
            <CommandDetail command={command} disableEdit={disableEdit} />
          </Drop>
        )}
        <Text size='small'><i>{command.description}</i></Text>
      </Box>
    </Box>
  )
}

function EditableAvatar({user}) {
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
          onChange={ (file) => mutation({variables: {id: user.id, attributes: {avatar: file}}})}
        >
          <span><Avatar user={user} /></span>
        </FilePicker>
      )}
    </Mutation>
  )
}

function BotDisplay({user, pad, onClick, disableEdit}) {
  return (
    <Box
      focusIndicator={false}
      direction='row'
      align='center'
      gap='xsmall'
      pad={pad || 'xxsmall'}
      onClick={() => onClick && onClick(user)}
      fill='horizontal'>
      {disableEdit ? <Avatar user={user} /> : <EditableAvatar user={user} />}
      <Box>
        <Text size='small' weight='bold'>{"@" + user.handle}</Text>
        <Text size='small' color='dark-6'>{user.name}</Text>
      </Box>
    </Box>
  )
}

function CommandDetail({command, disableEdit}) {
  return (
    <Box pad='small' style={{minWidth: '450px'}}>
      <Box direction='row' align='center'>
        <Box width='100%' direction='row'>
          <Text weight="bold" size='small' margin='5px'>/{command.name}</Text>
          <Text size='small' margin={{vertical: '5px'}}>help</Text>
        </Box>
      </Box>
      <Box direction='row' align='center'>
        <Markdown>{command.documentation || 'Someone needs to write their docs'}</Markdown>
      </Box>
      <Box border="bottom" direction="row" margin={{top: 'small'}} pad='small'>
        <Text>Attributes</Text>
      </Box>
      <Table caption='Attributes'>
        <TableBody>
          <TableRow>
            <TableCell><strong>Bot User</strong></TableCell>
            <TableCell><BotDisplay disableEdit={disableEdit} user={command.bot} /></TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Webhook Url</strong></TableCell>
            <TableCell>{command.webhook.url}</TableCell>
          </TableRow>
          {command.incomingWebhook && command.incomingWebhook.conversation && (
            <TableRow>
              <TableCell><strong>Incoming Webhook</strong></TableCell>
              <TableCell>
                <Box direction='row' align='center' gap='xsmall'>
                  <Copyable text={command.incomingWebhook.url} pillText='incoming webhook copied!' />
                  <Text size='small'>({command.incomingWebhook.conversation.name})</Text>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}

export default function CommandListEntry(props) {
  return (
    <Box direction='row' align='center' overflow='none'>
      <CommandDisplay {...props} />
    </Box>
  )
}