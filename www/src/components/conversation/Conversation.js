import React, { useState } from 'react'
import {Box, Text} from 'grommet'

function Conversation(props) {
  const [hover, setHover] = useState(false);
  let selected = props.conversation.id === props.currentConversation.id
  let boxProps = (selected) ? {background: '#0576B9'} : (hover ? {background: '#474A4D'} : {})
  let textProps = (selected) ? {} : {color: props.color}
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
      <Text margin={{right: '5px'}} {...textProps}>#</Text>
      <Text
        size='small'
        weight={(hover && !selected) ? 'bold' : 'normal'} {...textProps}>
        {props.conversation.name}
      </Text>
    </Box>
  )
}

export default Conversation