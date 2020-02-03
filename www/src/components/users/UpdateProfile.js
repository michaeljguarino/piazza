import React, { useState, useRef } from 'react'
import { Keyboard, Box } from 'grommet'
import { useMutation } from 'react-apollo'
import Button, { SecondaryButton } from '../utils/Button'
import InputField from '../utils/InputField'
import { UPDATE_USER } from './queries'
import { Editor } from 'slate-react'
import Plain from 'slate-plain-serializer'

const getUserFields = ({bio, title, phone}) => ({bio, title, phone})

export default function UpdateProfile({me, callback}) {
  const [userFields, setUserFields] = useState(getUserFields(me))
  const editorRef = useRef()
  const [mutation, {loading}] = useMutation(UPDATE_USER, {variables: {id: me.id, attributes: userFields}})
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
          <Editor
            ref={editorRef}
            defaultValue={Plain.deserialize(userFields.bio || "")}
            placeholder='A little bit about me'
            onChange={state => {
              const text = Plain.serialize(state.value)
              setUserFields({...userFields, bio: text})
            }} />
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