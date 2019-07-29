import React from 'react'
import {Form, FormField, Button, Box} from 'grommet'

function ConversationEditForm(props) {
  return (
    <Box pad="small" width="300px">
      <Form onSubmit={props.mutation}>
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
        <Box margin={{top: '5px'}}>
          <Button type='submit' primary label={props.action || 'create'} />
        </Box>
      </Form>
    </Box>
  )
}

export default ConversationEditForm