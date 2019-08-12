import React, {useState} from 'react'
import {Query} from 'react-apollo'
import {Box, Text} from 'grommet'
import {Pin} from 'grommet-icons'
import Scroller from '../utils/Scroller'
import Flyout, {FlyoutHeader} from '../utils/Flyout'
import {PINNED_MESSAGES} from '../messages/queries'
import {mergeAppend} from '../../utils/array'
import {BOX_ATTRS} from './ConversationHeader'


function PinnedMessages(props) {
  const [hover, setHover] = useState(false)
  const color = hover ? 'accent-1' : null
  return (
    <Query query={PINNED_MESSAGES} variables={{conversationId: props.conversation.id}}>
    {({loading, data, fetchMore}) => {
      if (loading) return (<Box direction='row'>...</Box>)
      const conv = data.conversation
      return (
        <Box
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          {...BOX_ATTRS}>
          <Text height='15px' style={{lineHeight: '15px'}} margin={{right: '3px'}}>
            <Pin size='15px' color={color} />
          </Text>
          <Text size='xsmall' color={color}>{conv.pinnedMessageCount}</Text>
        </Box>
      )
    }}
    </Query>

  )
}

export default PinnedMessages