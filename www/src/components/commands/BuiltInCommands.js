import React, {useState} from 'react'
import {Query} from 'react-apollo'
import {Box, Text} from 'grommet'
import {BUILT_IN, CREATE_COMMAND} from './queries'
import Expander from '../utils/Expander'
import Modal, {ModalHeader} from '../utils/Modal'
import {formStateFromCommand} from './CommandEditor'
import CommandListEntry from './CommandListEntry'
import {CommandForm} from './CommandCreator'

function BuiltInCommand(props) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      fill='horizontal'
      direction='row'
      align='center'
      pad='small'
      gap='xsmall'
      background={hover ? 'lightHover' : null}>
      <Box width='45px' align='center' justify='center'>
        <img alt='' src={props.builtin.avatar} width='45px' height='45px' />
      </Box>
      <Box>
        <Text size='small'>{props.builtin.name}</Text>
        <Text size='small'>{props.builtin.description}</Text>
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

function BuiltInCommandCreator(props) {
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

function WrappedBuiltInCommand(props) {
  return (
    <Modal
      target={<BuiltInCommand {...props} />}>
    {(setOpen) => (
      <BuiltInCommandCreator 
        setOpen={setOpen} 
        command={toCommand(props.builtin)}
        additionalVars={{bot: {avatar: props.builtin.avatar}}}
      />)}
    </Modal>
  )
}

function BuiltInCommands(props) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Box>
      <Box onClick={() => setExpanded(!expanded)}>
        <Expander text='Browse commands' expanded={expanded} />
      </Box>
      {expanded && (
        <Box style={{maxHeight: '100px'}}>
          <Query query={BUILT_IN}>
          {({data, loading}) => {
            if (loading) return null
            console.log(data)
            return (
              <Box>
                {data.builtinCommands.map((builtin, ind) => 
                  <WrappedBuiltInCommand key={ind} builtin={builtin} />
                )}
              </Box>
            )
          }}
          </Query>
        </Box>
      )}
    </Box>
  )
}

export default BuiltInCommands