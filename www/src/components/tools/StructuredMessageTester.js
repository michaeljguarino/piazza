import React, { useState } from 'react'
import { Box } from 'grommet'
import { useHistory } from 'react-router-dom'
import CodeEditor from '../utils/CodeEditor'
import StructuredMessage from '../messages/StructuredMessage'
import { ModalHeader } from '../utils/Modal'
const parseXml = require('@rgrove/parse-xml')

function parseMessage(msg) {
  if (!msg) return 'nothing entered yet'

  try {
    let json = parseXml(msg)
    let message = convertJson(json.children[0])
    return <StructuredMessage {...message} />
  } catch(e) {
    return null
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

export default function StructuredMessageTester() {
  const [message, setMessage] = useState(DUMMY_MESSAGE)
  const [parsed, setParsed] = useState(parseMessage(message))
  let history = useHistory()
  return (
    <Box>
      <ModalHeader big text='Structured Message Developer' setOpen={() => history.goBack()} />
      <Box style={{maxHeight: '80vh', minWidth: '60vw'}} pad='medium' gap='medium'>
        <Box direction='row' gap='medium' fill='horizontal'>
          <Box width='60%' border>
            <CodeEditor value={message} onChange={(text) =>  {
                setMessage(message)
                const parsed = parseMessage(text)
                if (parsed) {
                  setParsed(parsed)
                }
            }} lang='xml' />
          </Box>
          <Box pad='xsmall' border fill='horizontal'>
            {parsed}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}