import React, {useState} from 'react'
import {Form, Box, Text} from 'grommet'
import RadioButton from '../utils/RadioButton'

export const DEFAULT_PREFS = {mention: true, message: false, participant: false}
const filterPrefs = ({mention, message, participant}) => ({mention, message, participant})

function NotificationPreferences(props) {
  const [preferences, setPreferences] = useState(props.preferences)
  let onChange = (update) => {
    const prefs = {...preferences, ...update}
    setPreferences(prefs)
    props.mutation({variables: {...props.vars, prefs: filterPrefs(prefs)}})
  }

  return (
    <Box gap='small'>
      <Text>Notification Settings</Text>
      <Form onSubmit={() => props.mutation({variables: {...props.vars, prefs: preferences}})}>
        <Box gap='xsmall'>
          <RadioButton
            label="on each mention"
            enabled={preferences.mention}
            onChange={(e) => onChange({mention: e})} />
          <RadioButton
            label="on each new participant"
            enabled={preferences.participant}
            onChange={(e) => onChange({participant: e})} />
          <RadioButton
            label="on each message"
            enabled={preferences.message}
            onChange={(e) => onChange({message: e})} />
        </Box>
      </Form>
    </Box>
  )
}

export default NotificationPreferences