import React from 'react'
import {Form, FormField, Button, Box, CheckBox} from 'grommet'

function ConversationEditForm(props) {
  return (
    <Form onSubmit={props.mutation}>
      <Box width="300px">
        <FormField
          label="conversation name"
          name='name'
          value={props.state.name || 'conversation name'}
          onChange={(e) => props.onStateChange({name: e.target.value})}
          />
        <FormField
          label="topic"
          name='topic'
          value={props.state.topic || 'conversation topic'}
          onChange={(e) => props.onStateChange({topic: e.target.value})}
          />
        <CheckBox
          margin={{top: 'small'}}
          label='public'
          checked={props.state.public}
          onChange={(e) => props.onStateChange({public: e.target.checked})}
          />
        <Box margin={{top: 'small'}}>
          <Button type='submit' primary label={props.action || 'create'} />
        </Box>
      </Box>
    </Form>
  )
}

export default ConversationEditForm