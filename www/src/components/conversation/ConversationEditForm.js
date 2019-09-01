import React from 'react'
import {Keyboard, Box, CheckBox} from 'grommet'
import Button, {SecondaryButton} from '../utils/Button'
import InputField from '../utils/InputField'

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
        <Box direction='row' justify='end' gap='xsmall'>
          <SecondaryButton round='xsmall' label='Cancel' onClick={props.cancel} />
          <Button onClick={props.mutation} round='xsmall' label={props.action || 'Create'} />
        </Box>
      </Box>
    </Keyboard>
  )
}

export default ConversationEditForm