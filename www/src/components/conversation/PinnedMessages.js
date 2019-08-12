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
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false) }
      {...BOX_ATTRS}>
      <Text height='15px' style={{lineHeight: '15px'}} margin={{right: '3px'}}>
        <Pin size='15px' color={color} />
      </Text>
      <Text size='xsmall' color={color}>1</Text>
    </Box>
  )
}

export default PinnedMessages