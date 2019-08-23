import React, {useState} from 'react'
import onClickOutside from "react-onclickoutside";
import {ApolloConsumer} from 'react-apollo'
import {Box, TextInput} from 'grommet'
import {Search} from 'grommet-icons'
import {SEARCH_MESSAGES} from '../messages/queries'
import Message from '../messages/Message'


const animation = {
  transition: 'width 0.75s cubic-bezier(0.000, 0.795, 0.000, 1.000)'
};

function performSearch(client, query, conversationId, callback) {
  client.query({
    query: SEARCH_MESSAGES,
    variables: {conversationId, query}
  }).then(({data}) => (
    data.conversation.searchMessages.edges.map(({node}) => ({
      value: node,
      label: <Message message={node} />
    }))
  )).then(callback)
}

function MessageSearch(props) {
  const [expanded, setExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [value, setValue] = useState('')
  MessageSearch.handleClickOutside = () => {
    setExpanded(false)
    setValue('')
    setSuggestions([])
  }

  return (
    <ApolloConsumer>
    {client => (
      <Box
      onClick={() => setExpanded(true)}
      direction='row'
      height='35px'
      style={animation}
      width={expanded ? '90%' : '300px'}
      margin={{horizontal: '10px'}}
      border='all' align='center' justify='center' round='xsmall' pad='xsmall'>
        <Search size='20px' />
        <TextInput
          plain
          size='small'
          style={animation}
          value={value}
          suggestions={suggestions}
          onChange={(e) => {
            const text = e.target.value
            setValue(text)
            performSearch(client, text, props.conversation.id, setSuggestions)
          }}
          placeholder='this is for searching' />
    </Box>
    )}
    </ApolloConsumer>
  )
}

const clickOutsideConfig = {
  handleClickOutside: () => MessageSearch.handleClickOutside
};

export default onClickOutside(MessageSearch, clickOutsideConfig)