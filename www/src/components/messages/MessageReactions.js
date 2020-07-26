import React, { useContext } from 'react'
import { useMutation } from 'react-apollo'
import { Box, Text } from 'grommet'
import { Tooltip } from 'forge-core'
import 'emoji-mart/css/emoji-mart.css'
import { Emoji } from 'emoji-mart'
import { DELETE_REACTION, CREATE_REACTION, MESSAGES_Q } from './queries'
import { updateMessage } from './utils'
import { groupBy } from '../../utils/array'
import { CurrentUserContext } from '../login/EnsureLogin'
import { MessageReaction } from './MessageControls'

const BOX_ATTRS={
  pad:'3px',
  direction: 'row',
  focusIndicator: false,
  height: '25px',
  round: 'xsmall',
  align: 'center',
  justify: 'center'
}

function Reaction(props) {
  const prolog = props.reactions.slice(0, 3).map((reaction) => `@${reaction.user.handle}`)
  const text = prolog.length > 2 ? `${prolog.join(', ')} and ${props.reactions.length - prolog.length} more` :
                  prolog.length === 2 ? `${prolog[0]} and ${prolog[1]}` : prolog[0]
  const mutationQuery = props.reactions.find((r) => r.user.id === props.me.id) ?
                          DELETE_REACTION : CREATE_REACTION
  const [mutation] = useMutation(mutationQuery, {
    update: (cache, {data}) => {
      let message = data.deleteReaction || data.createReaction
      const prev = cache.readQuery({query: MESSAGES_Q, variables: {conversationId: props.conversation.id}})
      cache.writeQuery({
        query: MESSAGES_Q,
        variables: {conversationId: props.conversation.id},
        data: updateMessage(prev, message)
      })
    }
  })

  return (
    <Tooltip>
      <Box
        {...BOX_ATTRS}
        onClick={() => mutation({variables: {messageId: props.messageId, name: props.name}})}
        background='highlight'
        border={{color: 'highlightDark'}}>
        <Text size='10px'>
          <Emoji forceSize emoji={props.name} size={15} style={{lineHeight: 0}} />
        </Text>
        <Text size='10px' margin={{left: '3px'}} color='brand'>{props.reactions.length}</Text>
      </Box>
      <Text size='xsmall'>{text} reacted with :{props.name}:</Text>
    </Tooltip>
  )
}

export default function MessageReactions({message, conversation, hover, setPinnedHover}) {
  const me = useContext(CurrentUserContext)
  const grouped = groupBy(message.reactions, (reaction) => reaction.name)
  const sorted = Object.entries(grouped).sort(([name, reactions], [other_name, other_reactions]) => {
    const byLength = other_reactions.length - reactions.length

    if (byLength === 0) return other_name.localeCompare(name)
    return byLength
  })
  return (
    <Box direction='row' margin={{top: 'xsmall'}}>
      <Box direction='row' gap='xsmall' height='25px' margin={{right: 'xsmall'}}>
        {sorted.map(([name, reactions]) => (
          <Reaction
            key={name}
            me={me}
            conversation={conversation}
            name={name}
            reactions={reactions}
            messageId={message.id} />
        ))}
      </Box>
      <Box direction='row' height='25px' className="message-reactions">
        <MessageReaction
          message={message}
          conversation={conversation}
          setPinnedHover={setPinnedHover}
          position={['top', 'right', 'bottom']}
          label={'+'}
          boxAttrs={{...BOX_ATTRS, backgroud: 'white', border: true}} />
      </Box>
    </Box>
  )
}