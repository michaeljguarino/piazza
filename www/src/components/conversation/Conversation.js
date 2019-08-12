import React, { useState } from 'react'
import {Box, Text} from 'grommet'
import {Lock} from 'grommet-icons'

const HOVER_COLOR='#263449'

function Conversation(props) {
  const [hover, setHover] = useState(false);
  let selected = props.conversation.id === props.currentConversation.id
  let boxProps = (selected) ? {background: 'accent-1'} : (hover ? {background: HOVER_COLOR} : {})
  let unread = (props.conversation.unreadMessages > 0 && !selected)
  let textProps = (props.selected) ? {} : {color: (unread ? 'white' : props.color)}
  return (
    <Box
      fill='horizontal'
      direction='row'
      align='center'
      height='25px'
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