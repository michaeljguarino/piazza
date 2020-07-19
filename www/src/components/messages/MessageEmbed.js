import React from 'react'
import { Box, Text, Anchor, Markdown } from 'grommet'

function dimensions(props) {
  let width = props.width || '100px'
  let height = props.height || '100px'
  return {width, height}
}

function VideoEmbed({title, videoUrl, videoType}) {
  if (!videoUrl) return null

  switch (videoType) {
    case "EMBED":
      return <iframe height='200px' src={videoUrl} frameborder="0" type='text/html' title={title} />
    default:
      return <video controls src={videoUrl} style={{height: '200px'}} />
  }
}

function ImageEmbed({imageUrl}) {
  return (
    <img style={{height: '200px'}} src={imageUrl} />
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

function Publisher({publisher, logo}) {
  if (!publisher) return null

  return (
    <Box direction='row' gap='small' align='center'>
      {logo && <img height='15px' src={logo} />}
      <Text size='xsmall' color='dark-3'>{publisher}</Text>
    </Box>
  )
}

export default function MessageEmbed({title, description, publisher, logo, url, ...props}) {
  let dims = dimensions(props)
  props = {...props, ...dims}
  return (
    <Box margin={{vertical: 'xxsmall'}}>
      <Box round='xxsmall' direction='column' align='start' pad={{horizontal: 'small', vertical: 'xsmall'}}
           border={{side: 'left', color: 'light-6', size: '3px'}}>
        <Publisher publisher={publisher} logo={logo} />
        <Anchor size='small' _target='blank' style={{fontWeight: 500}} href={url}
           margin={publisher ? {top: 'xxsmall'} : null}>
          {title}
        </Anchor>
        <Markdown size='small' margin={{top: 'xxsmall', bottom: 'small'}}>{(description || '').trim()}</Markdown>
        <EmbedMedia {...props} />
      </Box>
    </Box>
  )
}