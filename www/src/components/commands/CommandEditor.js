import React, {useState} from 'react'
import {Box} from 'grommet'
import CommandListEntry from './CommandListEntry'
import {CommandForm} from './CommandCreator'
import {ModalHeader} from '../utils/Modal'
import {UPDATE_COMMAND} from './queries'

export function formStateFromCommand({name, description, documentation, webhook, incomingWebhook}) {
  let formState = {name, description, documentation, url: webhook && webhook.url}
  if (incomingWebhook) {
    formState.incomingWebhook = {name: incomingWebhook.conversation.name}
  }

  return formState
}

export default function CommandEditor({command, query, setOpen, additionalVars}) {
  const [formState, setFormState] = useState(formStateFromCommand(command))
  return (
    <Box width="600px" pad={{bottom: 'small'}} round='small'>
      <ModalHeader text={`Update ${command.name}`} setOpen={setOpen} />
      <Box pad={{horizontal: 'medium', bottom: 'small'}} gap='medium'>
        <Box direction='row' align='center' pad='small' border='bottom'>
          <Box align='center'>
            <CommandListEntry disableEdit command={{
              ...formState,
              bot: {name: formState.name, handle: formState.name, avatar: command.avatar || command.bot.avatar},
              webhook: {url: formState.url}
            }} />
          </Box>
        </Box>
        <CommandForm
          action='Update'
          mutation={query || UPDATE_COMMAND}
          vars={{commandName: command.name, ...(additionalVars || {})}}
          setOpen={setOpen}
          formState={formState}
          setFormState={setFormState} />
      </Box>
    </Box>
  )
}