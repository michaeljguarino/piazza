import React, {useState} from 'react'
import {Mutation, ApolloConsumer} from 'react-apollo'
import {Box, TextArea, Select, Text} from 'grommet'
import {ModalHeader} from '../utils/Modal'
import CommandListEntry from './CommandListEntry'
import InputField from '../utils/InputField'
import Button from '../utils/Button'
import {CREATE_COMMAND, COMMANDS_Q} from './queries'
import {addCommand} from './utils'
import {searchConversations} from '../search/ConversationSearch'

const LABEL_WIDTH = '100px'

function ConversationSelector(props) {
  const [options, setOptions] = useState([])
  const [value, setValue] = useState(null)
  return (
    <ApolloConsumer>
      {client => (
        <Select
          placeholder='Select a conversation for the incoming webhook'
          searchPlaceholder='Search conversations'
          emptySearchMessage='Nothing found'
          value={value ? value.label : undefined}
          valueKey={({value}) => value && value.id}
          options={options}
          width='100%'
          onChange={(e) => {
            const value = e.value
            props.onSelect(value.value)
            setValue(value)
          }}
          onSearch={(q) => searchConversations(client, q, setOptions)}
        >
          {({label}) => label}
        </Select>
      )}
    </ApolloConsumer>
  )
}

function CommandForm(props) {
  return (
    <Mutation
      mutation={CREATE_COMMAND}
      variables={props.formState}
      update={(cache, {data}) => {
        const prev = cache.readQuery({ query: COMMANDS_Q })
        cache.writeQuery({query: COMMANDS_Q, data: addCommand(prev, data.createCommand)})
        props.setOpen(false)
      }}>
      {mutation => (
        <Box gap='small'>
          <InputField
            labelWidth={LABEL_WIDTH}
            label='Name'
            value={props.formState.name}
            onChange={(e) => props.setFormState({...props.formState, name: e.target.value})} />
          <InputField
            labelWidth={LABEL_WIDTH}
            label='Description'
            value={props.formState.description}
            onChange={(e) => props.setFormState({...props.formState, description: e.target.value})} />
          <InputField
            labelWidth={LABEL_WIDTH}
            label='Webhook'
            value={props.formState.url}
            onChange={(e) => props.setFormState({...props.formState, url: e.target.value})} />
          <Box direction='row' fill='horizontal' align='center'>
            <Box width='150px'>
              <Text size='small' weight='bold'>Incoming Webhook</Text>
            </Box>
            <ConversationSelector onSelect={(conv) => {
              props.setFormState({...props.formState, incomingWebhook: {name: conv.name}})
            }} />
          </Box>
          <TextArea
            value={props.formState.documentation}
            placeholder='Documentation for this commmand (markdown is encouraged)'
            onChange={(e) => props.setFormState({...props.formState, documentation: e.target.value})} />
          <Box direction='row' justify='center'>
            <Button
              onClick={mutation}
              width='100%'
              pad={{vertical: 'xsmall', horizontal: 'medium'}}
              round='xsmall'
              label='Create' />
          </Box>
        </Box>
      )}
    </Mutation>
  )
}

function CommandCreator(props) {
  const [formState, setFormState] = useState({
    name: 'my-new-command',
    description: '',
    documentation: '',
    url: 'https://my.command.com/webhook'
  })
  return (
    <Box width="600px" pad={{bottom: 'small'}} round='small'>
      <ModalHeader text='Create a command' setOpen={props.setOpen} />
      <Box pad={{horizontal: 'medium', bottom: 'small'}} gap='medium'>
        <Box direction='row' align='center' pad='small' border='bottom'>
          <Box align='center'>
            <CommandListEntry disableEdit command={{
              ...formState,
              bot: {name: formState.name, handle: formState.name},
              webhook: {url: formState.url}
            }} />
          </Box>
        </Box>
        <CommandForm
          setOpen={props.setOpen}
          formState={formState}
          setFormState={setFormState} />
      </Box>
    </Box>
  )
}

export default CommandCreator