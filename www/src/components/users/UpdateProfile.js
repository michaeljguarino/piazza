import React, { useState } from 'react'
import { Keyboard, Box } from 'grommet'
import { useMutation } from 'react-apollo'
import { Button, InputCollection, ResponsiveInput } from 'forge-core'
import { UPDATE_USER } from './queries'
import {
  Slate,
  Editable,
} from 'slate-react'
import { plainDeserialize, plainSerialize } from '../../utils/slate'
import { useEditor } from '../utils/hooks'

const getUserFields = ({bio, title, phone}) => ({bio, title, phone})

export default function UpdateProfile({me}) {
  const [editorState, setEditorState] = useState(plainDeserialize(me.bio || ''))
  const [userFields, setUserFields] = useState(getUserFields(me))
  const editor = useEditor()
  const [mutation, {loading}] = useMutation(UPDATE_USER, {
    variables: {id: me.id, attributes: {...userFields, bio: plainSerialize(editorState)}}
  })

  return (
    <Keyboard onEnter={mutation}>
      <Box gap='small'>
        <InputCollection>
          <ResponsiveInput
            label='Title'
            value={userFields.title || ""}
            onChange={e => setUserFields({...userFields, title: e.target.value})}
          />
          <ResponsiveInput
            label='Phone'
            value={userFields.phone || ""}
            onChange={e => setUserFields({...userFields, phone: e.target.value})}
          />
        </InputCollection>
        <Box style={{minHeight: '150px'}} pad='small' border round='xsmall'>
          <Slate
            editor={editor}
            value={editorState}
            onChange={setEditorState}>
            <Editable placeholder='write a small bio' />
          </Slate>
        </Box>
        <Box direction='row' align='center' justify='end' gap='xsmall'>
          <Button loading={loading} round='xsmall' label='Save' onClick={mutation} />
        </Box>
      </Box>
    </Keyboard>
  )
}