import React, { useState, useMemo } from 'react'
import { Box, Select, Text } from 'grommet'
import { useApolloClient, useMutation } from 'react-apollo'
import { ModalHeader } from '../utils/Modal'
import CommandListEntry from './CommandListEntry'
import InputField from '../utils/InputField'
import Button, { SecondaryButton } from '../utils/Button'
import { CREATE_COMMAND, COMMANDS_Q } from './queries'
import { addCommand } from './utils'
import { searchConversations } from '../conversation/ConversationSearch'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import {
  Slate,
  Editable,
  withReact,
} from 'slate-react'
import {plainSerialize, plainDeserialize} from '../../utils/slate'

const LABEL_WIDTH = '100px'

export function ConversationSelector({onSelect}) {
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
        onSelect(value.value)
        setValue(value)
      }}
      onSearch={(q) => searchConversations(client, q, setOptions)}
    >
      {({label}) => label}
    </Select>
  )
}

export function CommandForm({formState, setFormState, vars, mutation, setOpen, action}) {
  const editor = useMemo(() => withReact(withHistory(createEditor())), [])
  const [editorState, setEditorState] = useState(plainDeserialize(formState.documentation))
  const additionalVars = vars || {}
  const {incomingWebhook, ...form} = formState
  const finalVars = incomingWebhook ? {...additionalVars, ...form, incomingWebhook} : {...additionalVars, ...form}
  const [loading, setLoading] = useState(false)
  const [mut] = useMutation(mutation || CREATE_COMMAND, {
    variables: {...finalVars, documentation: plainSerialize(editorState)},
    update: (cache, {data}) => {
      setLoading(false)
      const prev = cache.readQuery({ query: COMMANDS_Q })
      cache.writeQuery({query: COMMANDS_Q, data: addCommand(prev, data.createCommand || data.updateCommand)})
      setOpen(false)
    }
  })

  return (
    <Box gap='small'>
      <InputField
        labelWidth={LABEL_WIDTH}
        label='Name'
        value={formState.name}
        onChange={(e) => setFormState({...formState, name: e.target.value})} />
      <InputField
        labelWidth={LABEL_WIDTH}
        label='Description'
        value={formState.description}
        onChange={(e) => setFormState({...formState, description: e.target.value})} />
      <InputField
        labelWidth={LABEL_WIDTH}
        label='Webhook'
        value={formState.url}
        onChange={(e) => setFormState({...formState, url: e.target.value})} />
      <Box direction='row' fill='horizontal' align='center'>
        <Box width='150px'>
          <Text size='small' weight='bold'>Incoming Webhook</Text>
        </Box>
        <ConversationSelector onSelect={(conv) => {
          setFormState({...formState, incomingWebhook: {name: conv.name}})
        }} />
      </Box>
      <Box style={{minHeight: '150px'}} pad='small' border round='xsmall'>
        <Slate
          editor={editor}
          value={editorState}
          onChange={setEditorState}>
          <Editable placeholder='write a small bio' />
        </Slate>
      </Box>
      <Box direction='row' justify='end' align='center' gap='xsmall'>
        <SecondaryButton round='xsmall' label='Cancel' onClick={() => setOpen(false)} />
        <Button
          width='100px'
          loading={loading}
          onClick={() => {
            setLoading(true)
            mut()
          }}
          round='xsmall'
          label={action || 'Create'} />
      </Box>
    </Box>
  )
}

export default function CommandCreator({setOpen}) {
  const [formState, setFormState] = useState({
    name: 'my-new-command',
    description: '',
    documentation: '',
    url: 'https://my.command.com/webhook'
  })
  return (
    <Box width="600px" pad={{bottom: 'small'}} round='small'>
      <ModalHeader text='Create a command' setOpen={setOpen} />
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
          setOpen={setOpen}
          formState={formState}
          setFormState={setFormState} />
      </Box>
    </Box>
  )
}