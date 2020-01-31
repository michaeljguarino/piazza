import React from 'react'
import { Box, Text, Anchor } from 'grommet'

function dimensions(props) {
  let width = props.width || '100px'
  let height = props.height || '100px'
  return {width, height}
}

function VideoEmbed({url}) {
  return (
    <video autoPlay loop controls src={url}></video>
  )
}

function ImageEmbed({url}) {
  return (
    <image style={{maxHeight: '100px', maxWidth: '100px'}} src={url} />
  )
}

function SiteEmbed({image_url}) {
  return (image_url ?
    <img alt='' style={{maxHeight: '100px', maxWidth: '100px'}} src={image_url} fit='contain'/> :
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

export default function MessageEmbed(props) {
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