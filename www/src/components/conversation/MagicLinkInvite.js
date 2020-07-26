import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { Box, Anchor, Text } from 'grommet'
import { Copyable, Modal, ModalHeader, Button } from 'forge-core'
import { CREATE_INVITE } from './queries'
import { localized } from '../../helpers/hostname'
import { ConversationSelector } from '../commands/CommandCreator'

export function ExternalInvite({children}) {
  const [conversation, setConversation] = useState(null)
  const [mutation, {data}] = useMutation(CREATE_INVITE, {
    variables: {reference: conversation && conversation.id}
  })

  return (
    <Modal target={children}>
    {setOpen => (
      <Box width='30vw'>
        <ModalHeader text='Invite someone you know' setOpen={setOpen} />
        <Box pad='medium' gap='small'>
          <Box gap='xsmall'>
            <Text size='small' weight='bold'>Choose a conversation for them to join</Text>
            <ConversationSelector onSelect={(conv) => setConversation(conv)} />
          </Box>
          {data && data.createInvite && (
            <Copyable
              trimSize={50}
              text={genLink(data.createInvite)}
              pillText='magic link copied!' />
          )}
          <Box direction='row' justify='end' align='center'>
            <Button round='xsmall' label='Generate link' onClick={mutation} />
          </Box>
        </Box>
      </Box>
    )}
    </Modal>
  )
}

function genLink({token}) {
  return localized(`/invite/${token}`)
}

export default function MagicLinkInvite({conversation}) {
  const [mutation, { data }] = useMutation(CREATE_INVITE, {
    variables: {reference: conversation.id}
  })

  return (
    <Box pad='small'>
      {data && data.createInvite ?
        <Copyable text={genLink(data.createInvite)} pillText='magic link copied!' /> :
        <Anchor onClick={mutation}>generate invite link</Anchor>
      }
    </Box>
  )
}