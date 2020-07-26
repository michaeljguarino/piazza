import React, { useState } from 'react'
import { Keyboard, Box } from 'grommet'
import { useMutation } from 'react-apollo'
import { Button, SecondaryButton, InputField } from 'forge-core'
import { UPDATE_USER } from './queries'
import {
  Slate,
  Editable,
} from 'slate-react'
import { plainDeserialize, plainSerialize } from '../../utils/slate'
import { useEditor } from '../utils/hooks'

const getUserFields = ({bio, title, phone}) => ({bio, title, phone})

export default function UpdateProfile({me, callback}) {
  const [editorState, setEditorState] = useState(plainDeserialize(me.bio || ''))
  const [userFields, setUserFields] = useState(getUserFields(me))
  const editor = useEditor()
  const [mutation, {loading}] = useMutation(UPDATE_USER, {
    variables: {id: me.id, attributes: {...userFields, bio: plainSerialize(editorState)}}
  })

  const submit = () => {
    callback && callback()
    mutation()
  }

  return (
    <Keyboard onEnter={submit}>
      <>
      <Box gap='xsmall'>
        <InputField
          label='Title'
          value={userFields.title || ""}
          onChange={e => setUserFields({...userFields, title: e.target.value})}
        />
        <InputField
          label='Phone'
          value={userFields.phone || ""}
          onChange={e => setUserFields({...userFields, phone: e.target.value})}
        />
      </Box>
      <Box gap='small' pad={{top: 'small'}}>
        <Box style={{minHeight: '150px'}} pad='small' border round='xsmall'>
          <Slate
            editor={editor}
            value={editorState}
            onChange={setEditorState}>
            <Editable placeholder='write a small bio' />
          </Slate>
        </Box>
        <Box direction='row' align='center' justify='end' gap='xsmall'>
          <SecondaryButton round='xsmall' label='Cancel' onClick={callback} />
          <Button loading={loading} round='xsmall' label='Save' onClick={submit} />
        </Box>
      </Box>
      </>
    </Keyboard>
  )
}