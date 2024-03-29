import React, { useCallback, useState } from 'react'
import { useApolloClient } from 'react-apollo'
import { Box, TextInput } from 'grommet'
import { Search } from 'grommet-icons'
import { SEARCH_MESSAGES } from '../messages/queries'
import Message from '../messages/Message'
import { ScrollContext } from '../utils/SmoothScroller'

const animation = {
  outline: 'none',
  transition: 'width 0.75s cubic-bezier(0.000, 0.795, 0.000, 1.000)'
};

function performSearch(client, query, conversationId, callback, setAnchor) {
  client.query({
    query: SEARCH_MESSAGES,
    variables: {conversationId, query}
  }).then(({data: {conversation: {searchMessages}}}) => (
    searchMessages.edges.map(({node}) => ({
      value: node,
      label: (
        <ScrollContext.Provider value={{setSize: () => null}}>
          <Message
            onClick={() => setAnchor({timestamp: node.insertedAt, id: node.id})}
            message={node}
            setSize={() => null} />
        </ScrollContext.Provider>
      )
    }))
  )).then(callback)
}

function MessageSearch(props) {
  const [expanded, setExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [value, setValue] = useState('')
  const onBlur = useCallback(() => {
    setExpanded(false)
    setValue('')
    setSuggestions([])
  }, [setExpanded, setValue, setSuggestions])
  const client = useApolloClient()

  return (
    <Box onClick={() => setExpanded(true)} focusIndicator={false} direction='row'
      height='35px' style={animation}  width={expanded ? '90%' : '300px'} margin={{horizontal: '10px'}}
      border='all' align='center' justify='center' round='xsmall' pad='xsmall'>
      <Search size='20px' />
      <TextInput
        plain
        size='small'
        style={animation}
        value={value}
        onBlur={onBlur}
        suggestions={suggestions}
        onChange={({target: {value}}) => {
          setValue(value)
          performSearch(client, value, props.conversation.id, setSuggestions, props.setAnchor)
        }}
        placeholder='this is for searching' />
  </Box>
  )
}

export default MessageSearch