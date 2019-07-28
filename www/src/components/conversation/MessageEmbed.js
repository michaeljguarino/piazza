import React from 'react'
import {Box, Text, Image, Video} from 'grommet'

function dimensions(props) {
  let width = props.width || '200px'
  let height = props.height || '200px'
  return {width, height}
}

function VideoEmbed(props) {
  return (
    <img alt={props.title} style={{width: props.width, height: props.height}} src={props.url} />
  )
}

function ImageEmbed(props) {
  return (
    <Image src={props.url} />
  )
}


function EmbedMedia(props) {
  switch (props.type) {
    case "VIDEO":
      return <VideoEmbed {...props} />
    case "IMAGE":
      return <ImageEmbed {...props} />
    default:
      return (<div></div>)
  }
}

function MessageEmbed(props) {
  console.log(props)
  let dims = dimensions(props)
  props = {...props, ...dims}
  return (
    <Box direction='row' align='center' gap='small'>
      <EmbedMedia {...props} />
      <Box direction='column' align='start'>
        <Text weight='bold' size='small'>{props.title}</Text>
        <Text size='small'>{props.description}</Text>
      </Box>
    </Box>
  )
}

export default MessageEmbed