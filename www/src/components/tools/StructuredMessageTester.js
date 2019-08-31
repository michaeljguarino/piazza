import React, {useState} from 'react'
import {Box, TextArea} from 'grommet'
import StructuredMessage from '../messages/StructuredMessage'
const parseXml = require('@rgrove/parse-xml')

function parseMessage(msg) {
  if (!msg) return 'nothing entered yet'

  try {
    let json = parseXml(msg)
    let message = convertJson(json.children[0])
    return <StructuredMessage {...message} />
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

const DUMMY_MESSAGE = `<root>
  <box pad="small">
    <text>Hello World!</text>
  </box>
</root>
`

function StructuredMessageTester(props) {
  const [message, setMessage] = useState(DUMMY_MESSAGE)

  return (
    <Box pad='medium' width='50vw' height='80vh' gap='medium'>
      <Box direction='row' gap='medium' height='100%' fill='horizontal'>
        <TextArea
          value={message}
          placeholder='Put your contents here'
          onChange={(e) => setMessage(e.target.value) } />
        <Box pad='small' border round='small' style={{minWidth: '60%'}}>
          {parseMessage(message)}
        </Box>
      </Box>
    </Box>
  )
}

export default StructuredMessageTester