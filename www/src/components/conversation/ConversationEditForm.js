import React from 'react'
import {Keyboard, Text, Box, CheckBox, TextInput} from 'grommet'
import Button from '../utils/Button'

function InputField(props) {
  return (
    <Box direction='row' align='center'>
      <Box width='50px'>
        <Text size='small' margin={{right: 'small'}} weight='bold'>{props.label}</Text>
      </Box>
      <TextInput
        name='name'
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        />
    </Box>
  )
}

function ConversationEditForm(props) {
  return (
    <Keyboard onEnter={props.mutation}>
      <Box width="300px" gap='small'>
        <InputField
          label='Name'
          value={props.state.name}
          placeholder='conversation name'
          onChange={(e) => props.onStateChange({name: e.target.value})} />
        <InputField
          label='Topic'
          value={props.state.topic}
          placeholder='conversation topic'
          onChange={(e) => props.onStateChange({topic: e.target.value})} />
        <Box direction='row' align='center'>
          <CheckBox
            margin={{top: 'small'}}
            label='Public'
            checked={props.state.public}
            onChange={(e) => props.onStateChange({public: e.target.checked})}
          />
        </Box>
        <Box direction='row' justify='center'>
          <Button
            onClick={props.mutation}
            width='100%'
            pad={{vertical: 'xsmall', horizontal: 'medium'}}
            round='xsmall'
            label={props.action || 'Create'} />
        </Box>
      </Box>
    </Keyboard>
  )
}

export default ConversationEditForm