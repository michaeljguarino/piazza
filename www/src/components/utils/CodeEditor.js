import React, {useState} from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/theme/nord.css'
import "codemirror/lib/codemirror.css"
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/yaml/yaml');
require('codemirror/mode/xml/xml');


export default function CodeEditor({value, onChange, lang}) {
  const [state, setState] = useState(value)
  return (
    <CodeMirror value={state}
                options={{mode: lang || 'xml', lineNumbers: true}}
                onChange={(val) => {
                  setState(val)
                  onChange(val)
                 }} />
  )
}

