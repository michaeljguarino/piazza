import React, {useState} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Anchor} from 'grommet'
import {CREATE_INVITE} from './queries'
import {localized} from '../../helpers/hostname'
import {CopyToClipboard} from 'react-copy-to-clipboard'

const MAX_LINK_LENGTH = 40

function trimmedLink(link) {
  if (link.length > MAX_LINK_LENGTH) {
    return link.substring(0, MAX_LINK_LENGTH)
  }
  return link
}

function LinkDisplay(props) {
  const fullLink = localized(`/invite/${props.link}`)
  return (
    <CopyToClipboard text={fullLink}>
      <Anchor size='small'>{trimmedLink(fullLink)}</Anchor>
    </CopyToClipboard>
  )
}

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
        <LinkDisplay link={link} /> :
        <LinkCreate onCreate={setLink} {...props} />
      }
    </Box>
  )
}

export default MagicLinkInvite