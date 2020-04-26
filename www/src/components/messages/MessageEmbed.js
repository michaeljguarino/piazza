import React from 'react'
import { Box, Text, Anchor } from 'grommet'

function dimensions(props) {
  let width = props.width || '100px'
  let height = props.height || '100px'
  return {width, height}
}

function VideoEmbed({url}) {
  return (
    <video autoPlay controls src={url} style={{maxHeight: '200px', maxWidth: '200px'}}></video>
  )
}

function ImageEmbed({url}) {
  return (
    <img style={{maxHeight: '100px', maxWidth: '100px'}} src={url} />
  )
}

function SiteEmbed({image_url}) {
  return (image_url ?
    <img alt='' style={{maxHeight: '100px', maxWidth: '100px'}} src={image_url} fit='contain'/> :
    null
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
      return null
  }
}

export default function MessageEmbed(props) {
  let dims = dimensions(props)
  props = {...props, ...dims}
  return (
    <Box direction='row' align='center' gap='small' pad='small' border={{side: 'left', color: 'dark-3', width: '3px'}}>
      <EmbedMedia {...props} />
      <Box direction='column' align='start' gap='xsmall'>
        <Anchor _target='blank' href={props.url} weight='bold' size='medium'>{props.title}</Anchor>
        <Text size='small'>{props.description}</Text>
      </Box>
    </Box>
  )
}