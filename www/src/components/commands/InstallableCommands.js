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

function InstallableCommand(props) {
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
        <img alt='' src={props.installable.avatar} width='45px' height='45px' />
      </Box>
      <Box>
        <Text size='small'>{props.installable.name}</Text>
        <Text size='small'>{props.installable.description}</Text>
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

function InstallableCommandCreator(props) {
  const [formState, setFormState] = useState(formStateFromCommand(props.command))
  return (
    <Box width="600px" pad={{bottom: 'small'}} round='small'>
      <ModalHeader text={`Update ${props.command.name}`} setOpen={props.setOpen} />
      <Box pad={{horizontal: 'medium', bottom: 'small'}} gap='medium'>
        <Box direction='row' align='center' pad='small' border='bottom'>
          <Box align='center'>
            <CommandListEntry disableEdit command={{
              ...formState,
              bot: {name: formState.name, handle: formState.name, avatar: props.command.avatar || props.command.bot.avatar},
              webhook: {url: formState.url}
            }} />
          </Box>
        </Box>
        <CommandForm
          action='Create'
          mutation={CREATE_COMMAND}
          vars={{...(props.additionalVars || {}), commandName: props.command.name}}
          setOpen={props.setOpen}
          formState={formState}
          setFormState={setFormState} />
      </Box>
    </Box>
  )
}

function WrappedInstallableCommand(props) {
  return (
    <Modal
      target={<InstallableCommand {...props} />}>
    {(setOpen) => (
      <InstallableCommandCreator
        setOpen={setOpen}
        command={toCommand(props.installable)}
        additionalVars={{bot: {avatar: props.installable.avatar}}}
      />)}
    </Modal>
  )
}

const onFetchMore = (prev, {fetchMoreResult}) => {
  const {edges, pageInfo} = fetchMoreResult.installableCommands
  return edges.length ? {
    ...prev,
    installableCommands: {
      ...prev.installableCommands,
      pageInfo,
      edges: mergeAppend(edges, prev.installableCommands.edges, ({node}) => node.id)
    }
  } : prev;
}

function InstallableCommands(props) {
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
          onLoadMore={() => {
            if (!pageInfo.hasNextPage) return
            fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: onFetchMore
            })
          }}/>
      </Box>
    </Box>
  )
}

export default InstallableCommands