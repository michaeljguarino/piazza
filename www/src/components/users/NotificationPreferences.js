import React, {useState} from 'react'
import {CheckBox, Form, Box, Text} from 'grommet'

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
    <Box pad='small' gap='small'>
      <Text>Notification Settings</Text>
      <Form onSubmit={props.mutation({variables: {...props.vars, prefs: preferences}})}>
        <Box gap='xsmall'>
          <CheckBox
            label="on each mention"
            checked={preferences.mention}
            onChange={(e) => onChange({mention: e.target.checked})} />
          <CheckBox
            label="on each new participant"
            checked={preferences.participant}
            onChange={(e) => onChange({participant: e.target.checked})} />
          <CheckBox
            label="on each message"
            checked={preferences.message}
            onChange={(e) => onChange({message: e.target.checked})} />
        </Box>
      </Form>
    </Box>
  )
}

export default NotificationPreferences