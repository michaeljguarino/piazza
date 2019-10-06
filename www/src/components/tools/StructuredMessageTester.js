import React, {useState, useRef} from 'react'
import {Box} from 'grommet'
import { Editor } from 'slate-react'
import Plain from 'slate-plain-serializer'
import StructuredMessage from '../messages/StructuredMessage'
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

function StructuredMessageTester(props) {
  const editorRef = useRef()
  const [message, setMessage] = useState(parseMessage(DUMMY_MESSAGE))

  return (
    <Box style={{maxHeight: '80vh', minWidth: '40vw'}} pad='medium' gap='medium'>
      <Box direction='row' gap='medium' fill='horizontal'>
        <Box border round='small' pad='small' style={{minWidth: '60%'}}>
          <Editor
            ref={editorRef}
            defaultValue={Plain.deserialize(DUMMY_MESSAGE)}
            onChange={state => {
              const text = Plain.serialize(state.value)
              const parsed = parseMessage(text)
              if (parsed) {
                setMessage(parsed)
              }
            }} />
        </Box>
        <Box pad='xsmall' border round='small' fill='horizontal'>
          {message}
        </Box>
      </Box>
    </Box>
  )
}

export default StructuredMessageTester