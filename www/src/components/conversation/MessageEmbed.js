import React from 'react'
import {Box, Text, Image, Video, Anchor} from 'grommet'

function dimensions(props) {
  let width = props.width || '200px'
  let height = props.height || '200px'
  return {width, height}
}

function VideoEmbed(props) {
  return (
    <Video autoPlay loop src={props.url} />
  )
}

function ImageEmbed(props) {
  return (
    <Image src={props.url} />
  )
}

function SiteEmbed(props) {
  return (props.image_url ?
    <img style={{maxHeight: '200px', maxWidth: '200px'}} src={props.image_url} fit='contain'/> :
    <span></span>
  )
}


function EmbedMedia(props) {
  switch (props.type) {
    case "VIDEO":
      return <VideoEmbed {...props} />
    case "IMAGE":
      return <ImageEmbed {...props} />
    case "SITE":
      return <SiteEmbed {...props} />
    default:
      return (<div></div>)
  }
}

function MessageEmbed(props) {
  let dims = dimensions(props)
  props = {...props, ...dims}
  return (
    <Box direction='row' align='center' gap='small'>
      <EmbedMedia {...props} />
      <Box direction='column' align='start' gap='xsmall'>
        <Anchor _target='blank' href={props.url} weight='bold' size='medium'>{props.title}</Anchor>
        <Text size='small'>{props.description}</Text>
      </Box>
    </Box>
  )
}

export default MessageEmbed