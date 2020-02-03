import React, {useState} from 'react'
import {useQuery} from 'react-apollo'
import {Box, Text} from 'grommet'
import {INSTALLABLE_COMMANDS, CREATE_COMMAND} from './queries'
import Modal, {ModalHeader} from '../utils/Modal'
import {formStateFromCommand} from './CommandEditor'
import CommandListEntry from './CommandListEntry'
import {CommandForm} from './CommandCreator'
import Scroller from '../utils/Scroller'
import {mergeAppend} from '../../utils/array'

function InstallableCommand({installable}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{cursor: 'pointer'}}
      fill='horizontal'
      direction='row'
      align='center'
      pad='small'
      gap='small'
      background={hover ? 'lightHover' : null}>
      <Box width='45px' align='center' justify='center'>
        <img alt='' src={installable.avatar} width='45px' height='45px' />
      </Box>
      <Box>
        <Text size='small'>{installable.name}</Text>
        <Text size='small'>{installable.description}</Text>
      </Box>
    </Box>
  )
}

function toCommand(builtin) {
  const {name, description, documentation, webhook, avatar} = builtin

  return {
    name,
    description,
    documentation,
    webhook: {url: webhook},
    bot: {avatar}
  }
}

function InstallableCommandCreator({additionalVars, command, setOpen}) {
  const [formState, setFormState] = useState(formStateFromCommand(command))
  return (
    <Box width="600px" pad={{bottom: 'small'}} round='small'>
      <ModalHeader text={`Update ${command.name}`} setOpen={setOpen} />
      <Box pad={{horizontal: 'medium', bottom: 'small'}} gap='medium'>
        <Box direction='row' align='center' pad='small' border='bottom'>
          <Box align='center'>
            <CommandListEntry disableEdit command={{
              ...formState,
              bot: {name: formState.name, handle: formState.name, avatar: command.avatar || command.bot.avatar},
              webhook: {url: formState.url}
            }} />
          </Box>
        </Box>
        <CommandForm
          action='Create'
          mutation={CREATE_COMMAND}
          vars={{...(additionalVars || {}), commandName: command.name}}
          setOpen={setOpen}
          formState={formState}
          setFormState={setFormState} />
      </Box>
    </Box>
  )
}

function WrappedInstallableCommand({installable}) {
  return (
    <Modal
      target={<InstallableCommand installable={installable} />}>
    {(setOpen) => (
      <InstallableCommandCreator
        setOpen={setOpen}
        command={toCommand(installable)}
        additionalVars={{bot: {avatar: installable.avatar}}}
      />)}
    </Modal>
  )
}

const onFetchMore = (prev, {fetchMoreResult: {installableCommands: {edges, pageInfo}}}) => {
  return edges.length ? {
    ...prev,
    installableCommands: {
      ...prev.installableCommands,
      pageInfo,
      edges: mergeAppend(edges, prev.installableCommands.edges, ({node}) => node.id)
    }
  } : prev;
}

export default function InstallableCommands() {
  const {data, loading, fetchMore} = useQuery(INSTALLABLE_COMMANDS)
  if (loading) return null
  const {edges, pageInfo} = data.installableCommands

  return (
    <Box>
      <Box pad='small'>
        <Text size='small'>
          <i>We ship with a few commands you can choose to install as-is</i>
        </Text>
      </Box>
      <Box>
        <Scroller
          id='installable-commands-viewport'
          edges={edges}
          style={{overflow: 'auto', maxHeight: '80%'}}
          mapper={({node}) => (<WrappedInstallableCommand key={node.id} installable={node} />)}
          onLoadMore={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: onFetchMore
          })}/>
      </Box>
    </Box>
  )
}