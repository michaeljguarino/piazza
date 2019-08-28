import React, {useState} from 'react'
import {Box, Text, TextArea} from 'grommet'
import StructuredMessage from '../messages/StructuredMessage'
const parseXml = require('@rgrove/parse-xml')

function parseMessage(msg) {
  if (!msg) return 'nothing entered yet'

  try {
    let json = parseXml(msg)
    return <StructuredMessage {...convertJson(json.children[0])} />
  } catch(e) {
    return e.message
  }
}

function convertJson(node) {
  if (node.type !== 'element') return null

  let jsonNode = {_type: node.name, attributes: node.attributes || {}}
  if (node.children && node.children.length === 1 && node.children[0].type === 'text') {
    jsonNode.attributes['value'] = node.children[0].text
    return jsonNode
  } else if (node.children) {
    jsonNode.children = node.children.map(convertJson).filter((e) => !!e)
  }

  return jsonNode
}

function StructuredMessageTester(props) {
  const [message, setMessage] = useState('')

  return (
    <Box pad='small' width='80vw' height='80vh' gap='medium'>
      <Box fill='horizontal' direction='row' justify='center' height='50px'>
        <Text weight='bold' size='small'>Structured Message Developer</Text>
      </Box>
      <Box direction='row' gap='medium' height='100%' fill='horizontal'>
        <TextArea
          value={message}
          placeholder='Put your contents here'
          onChange={(e) => setMessage(e.target.value) } />
        <Box pad='small' border round='small' width='40%'>
          {parseMessage(message)}
        </Box>
      </Box>
    </Box>
  )
}

export default StructuredMessageTester