import React, {useState} from 'react'
import { Form, Box, Text, CheckBox } from 'grommet'

export const DEFAULT_PREFS = {mention: true, message: false, participant: false}
const filterPrefs = ({mention, message, participant}) => ({mention, message, participant})

export default function NotificationPreferences({preferences, vars, mutation}) {
  const [prefs, setPrefs] = useState(preferences)
  let onChange = (update) => {
    const updated = {...prefs, ...update}
    setPrefs(updated)
    mutation({variables: {...vars, prefs: filterPrefs(updated)}})
  }

  return (
    <Box gap='small'>
      <Text>Notification Settings</Text>
      <Form onSubmit={() => mutation({variables: {...vars, prefs: preferences}})}>
        <Box gap='xsmall'>
          <CheckBox
            toggle
            label="on each mention"
            checked={prefs.mention}
            onChange={(e) => onChange({mention: e.target.checked})} />
          <CheckBox
            toggle
            label="on each new participant"
            checked={prefs.participant}
            onChange={(e) => onChange({participant: e.target.checked})} />
          <CheckBox
            toggle
            label="on each message"
            checked={prefs.message}
            onChange={(e) => onChange({message: e.target.checked})} />
        </Box>
      </Form>
    </Box>
  )
}