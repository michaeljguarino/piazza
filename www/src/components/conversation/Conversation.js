import React, { useState } from 'react'
import {Box, Text} from 'grommet'
import {Lock} from 'grommet-icons'

function Conversation(props) {
  const [hover, setHover] = useState(false);
  let selected = props.conversation.id === props.currentConversation.id
  // #0576B9'
  let boxProps = (selected) ? {background: 'accent-1'} : (hover ? {background: '#2b3c54'} : {})
  let unread = (props.conversation.unreadMessages > 0 && !selected)
  let textProps = (props.selected) ? {} : {color: (unread ? 'white' : props.color)}
  return (
    <Box
      fill='horizontal'
      direction='row'
      align='center'
      style={{cursor: 'pointer'}}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => props.setCurrentConversation(props.conversation)}
      pad={props.pad}
      {...boxProps}
      >
      {props.conversation.public && <Text margin={{right: '5px'}} {...textProps}>#</Text>}
      {!props.conversation.public && <Lock style={{marginRight: '5px'}} size='14px' {...textProps} />}
      <Text
        size='small'
        {...textProps} >
        {props.conversation.name}
      </Text>
    </Box>
  )
}

export default Conversation