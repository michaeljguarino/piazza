import React from 'react'
import {Keyboard, Box, CheckBox} from 'grommet'
import Button, {SecondaryButton} from '../utils/Button'
import InputField from '../utils/InputField'

export default function ConversationEditForm({loading, mutation, state, onStateChange, action, cancel}) {
  return (
    <Keyboard onEnter={mutation}>
      <Box width="330px" gap='small'>
        <InputField
          label='Name'
          value={state.name}
          placeholder='conversation name'
          onChange={(e) => onStateChange({name: e.target.value})} />
        <InputField
          label='Topic'
          value={state.topic}
          placeholder='conversation topic'
          onChange={(e) => onStateChange({topic: e.target.value})} />
        <Box gap='small' border='horizontal' pad={{vertical: 'small'}}>
          <CheckBox
            toggle
            label={state.public ?
              'Public (the conversation is searchable)' :
              'Private (can only join via invite)'}
            checked={state.public}
            onChange={(e) => onStateChange({public: e.target.checked})}
          />
          <CheckBox
            toggle
            label={state.archived ?
              "Archived (messages won't be pruned)" :
              'Unarchived (old messages will be pruned)'}
            checked={state.archived}
            onChange={(e) => onStateChange({archived: e.target.checked})}
          />
        </Box>
        <Box direction='row' justify='end' gap='xsmall'>
          <SecondaryButton round='xsmall' label='Cancel' onClick={cancel} />
          <Button loading={loading} onClick={mutation} round='xsmall' label={action || 'Create'} />
        </Box>
      </Box>
    </Keyboard>
  )
}