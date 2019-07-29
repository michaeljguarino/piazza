import React from 'react'
import {Box, Text} from 'grommet'
import {Alert} from 'grommet-icons'

function Error(props) {
  let limit = props.limit || 1
  let errors = props.errors.graphQLErrors || [{message: (props.default || 'something went wrong')}]
  return (
    <Box direction='column' gap='xsmall' border='all' pad='xsmall' margin={{bottom: '10px'}}>
      {errors.slice(0, limit).map(error => {
        return (
          <Box direction='row' gap='xsmall' justify='center' align='center'>
            <Alert size="15px"/>
            <Text style={{lineHeight: '15px'}}>
              {error.message.replace("_", ' ')}
            </Text>
        </Box>)
      })}
    </Box>
  )
}

export default Error