import React, {useState, useRef} from 'react'
import {useApolloClient, useMutation} from 'react-apollo'
import {Box, Select, Text} from 'grommet'
import {ModalHeader} from '../utils/Modal'
import CommandListEntry from './CommandListEntry'
import InputField from '../utils/InputField'
import Button, {SecondaryButton} from '../utils/Button'
import {CREATE_COMMAND, COMMANDS_Q} from './queries'
import {addCommand} from './utils'
import {searchConversations} from '../conversation/ConversationSearch'
import { Editor } from 'slate-react'
import Plain from 'slate-plain-serializer'

const LABEL_WIDTH = '100px'

export function ConversationSelector(props) {
  const [options, setOptions] = useState([])
  const [value, setValue] = useState(null)
  const client = useApolloClient()

  return (
    <Select
      placeholder='Select a conversation'
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
  )
}

export function CommandForm(props) {
  const editorRef = useRef()
  const additionalVars = props.vars || {}
  const {incomingWebhook, ...form} = props.formState
  const vars = incomingWebhook ? {...additionalVars, ...form, incomingWebhook} : {...additionalVars, ...form}
  const [loading, setLoading] = useState(false)
  const [mutation] = useMutation(props.mutation || CREATE_COMMAND, {
    variables: vars,
    update: (cache, {data}) => {
      setLoading(false)
      const prev = cache.readQuery({ query: COMMANDS_Q })
      cache.writeQuery({query: COMMANDS_Q, data: addCommand(prev, data.createCommand || data.updateCommand)})
      props.setOpen(false)
    }
  })

  return (
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
      <Box style={{minHeight: '150px'}} pad='small' border round='xsmall'>
        <Editor
          ref={editorRef}
          defaultValue={Plain.deserialize(props.formState.documentation)}
          placeholder='Documentation for this commmand (markdown is encouraged)'
          onChange={state => {
            const text = Plain.serialize(state.value)
            props.setFormState({...props.formState, documentation: text})
          }} />
      </Box>
      <Box direction='row' justify='end' align='center' gap='xsmall'>
        <SecondaryButton round='xsmall' label='Cancel' onClick={() => props.setOpen(false)} />
        <Button
          width='100px'
          loading={loading}
          onClick={() => {
            setLoading(true)
            mutation()
          }}
          round='xsmall'
          label={props.action || 'Create'} />
      </Box>
    </Box>
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
      <Box pad={{horizontal: 'medium', bottom: 'small'}}>
        <Box direction='row' align='center' pad={{vertical: 'small'}}>
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