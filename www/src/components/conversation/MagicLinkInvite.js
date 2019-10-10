import React, {useState} from 'react'
import {useMutation} from 'react-apollo'
import {Box, Anchor} from 'grommet'
import {CREATE_INVITE} from './queries'
import {localized} from '../../helpers/hostname'
import Copyable from '../utils/Copyable'

function MagicLinkInvite(props) {
  const [link, setLink] = useState(null)
  const [mutation] = useMutation(CREATE_INVITE, {
    variables: {reference: props.conversation.id},
    update: (cache, {data}) => {
      setLink(data.createInvite.token)
    }
  })

  return (
    <Box pad='small'>
      {link ?
        <Copyable text={localized(`/invite/${link}`)} pillText='magic link copied!' /> :
        <Anchor onClick={mutation}>generate invite link</Anchor>
      }
    </Box>
  )
}

export default MagicLinkInvite