import React from 'react'
import { Box, Text, Anchor } from 'grommet'

function dimensions(props) {
  let width = props.width || '100px'
  let height = props.height || '100px'
  return {width, height}
}

function VideoEmbed({url}) {
  return (
    <video controls src={url} style={{height: '200px'}}></video>
  )
}

function ImageEmbed({imageUrl}) {
  return (
    <img style={{height: '50px'}} src={imageUrl} />
  )
}

function SiteEmbed({imageUrl}) {
  return imageUrl && <img alt='' style={{maxHeight: '100px', maxWidth: '100px'}} src={imageUrl} fit='contain'/>
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
        <Anchor size='small' _target='blank' href={props.url} size='medium'>{props.title}</Anchor>
        <Text size='small'>{props.description}</Text>
      </Box>
    </Box>
  )
}