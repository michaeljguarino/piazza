import React, {useState} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Anchor} from 'grommet'
import {CREATE_INVITE} from './queries'
import {localized} from '../../helpers/hostname'
import Copyable from '../utils/Copyable'

function LinkCreate(props) {
  return (
    <Mutation
      mutation={CREATE_INVITE}
      variables={{reference: props.conversation.id}}
      update={(cache, {data}) => {
        props.onCreate(data.createInvite.token)
      }}>
    {mutation => (
      <Anchor onClick={mutation}>generate invite link</Anchor>
    )}
    </Mutation>
  )
}

function MagicLinkInvite(props) {
  const [link, setLink] = useState(null)
  return (
    <Box pad='small'>
      {link ?
        <Copyable text={localized(`/invite/${link}`)} pillText='magic link copied!' /> :
        <LinkCreate onCreate={setLink} {...props} />
      }
    </Box>
  )
}

export default MagicLinkInvite