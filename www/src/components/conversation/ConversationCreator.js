import React, {useState} from 'react'
import {Box, Text, Form, FormField, Button} from 'grommet'
import {Add} from 'grommet-icons'
import { Mutation } from 'react-apollo'
import Dropdown from '../utils/Dropdown'
import {CREATE_CONVERSATION, CONVERSATIONS_Q} from './queries'

function ConversationCreator(props) {
  const [state, setState] = useState({})
  return (
    <Box fill='horizontal' pad={{right: '10px'}}>
      <Box pad={props.padding} fill='horizontal' direction="row" align="center" margin={{bottom: '5px'}}>
        <Box width='100%'>
          <Text size='small' width='100%' weight='bold' color={props.textColor}>Conversations</Text>
        </Box>
        <Dropdown>
          <Box
            style={{cursor: 'pointer'}}
            border
            round='full'
            width="20px"
            height='20px'
            justify='center'
            align='center'>
            <Add size="small" />
          </Box>
          <Box pad="small" width="300px">
            <Mutation
              mutation={CREATE_CONVERSATION}
              variables={state}
              update={(cache, {data: {createConversation}}) => {
                console.log(createConversation)
                const {conversations} = cache.readQuery({ query: CONVERSATIONS_Q });
                cache.writeQuery({
                  query: CONVERSATIONS_Q,
                  data: {
                    conversations: {
                      edges: [{__typename: "ConversationEdge", node: createConversation.data}, ...conversations.edges],
                      ...conversations
                    },
                }});
              }}
            >
              {mutation => (
                <Form onSubmit={mutation}>
                  <FormField
                    label="Conversation Name"
                    name="name"
                    value="new conversation"
                    onChange={(e) => setState({name: e.target.value})}
                    />
                  <Button type='submit' primary label='create' onClick={mutation} />
                </Form>
              )}
            </Mutation>
          </Box>
        </Dropdown>
      </Box>
    </Box>
  )
}

export default ConversationCreator