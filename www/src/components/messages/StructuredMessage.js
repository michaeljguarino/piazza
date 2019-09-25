import React from 'react'
import {Box, Text, Markdown, Anchor} from 'grommet'

function recurse(children) {
  if (!children) return null
  return children.map(parse)
}

function video(props) {
  const {url, loop, autoPlay, ...rest} = props.attributes
  return (
    <video
      style={{maxWidth: '250px', maxHeight: '250px'}}
      key={props.key}
      loop={!!loop}
      autoPlay={!!autoPlay}
      {...rest}
      src={url}
    />
  )
}

function box(props) {
  const {children, attributes} = props
  return (
    <Box key={props.key} {...attributes}>
      {recurse(children)}
    </Box>
  )
}

function attachment(props, i) {
  const {children, attributes} = props
  const {accent, ...rest} = attributes || {}
  return (
    <Box key={props.key} border background='white'>
      <Box {...rest} style={{
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: accent || 'rgba(35, 137, 215, 0.5)'}}>
        {recurse(children)}
      </Box>
    </Box>
  )
}

function text(props) {
  const attrs = props.attributes || {}
  const value = attrs.value || props.value
  const {size, ...rest} = attrs
  return (<Text key={props.key} size={size || 'small'} {...rest}>{value}</Text>)
}

function markdown(props) {
  const {value, ...rest} = props.attributes
  if (!value) return null

  return (
    <Markdown
      key={props.key}
      components={{p: {props: {size: 'small', margin: {top: 'xsmall', bottom: 'xsmall'}}}}}
      {...rest}>
      {value}
    </Markdown>
  )
}

function image(props) {
  const {url, ...rest} = props.attributes
  return <img key={props.key} alt={url} {...rest} src={url} />
}

function link(props) {
  const {attributes, children} = props
  const value = props.value || attributes.value
  return <Anchor key={props.key} {...attributes}>{value ? value :  recurse(children)}</Anchor>
}

function parse(struct, index) {
  const props = {...struct, key: index}
  switch (struct._type) {
    case "box":
      return box(props)
    case "video":
      return video(props)
    case "attachment":
      return attachment(props)
    case "text":
      return text(props)
    case "markdown":
      return markdown(props)
    case "image":
      return image(props)
    case "link":
      return link(props)
    default:
      return null
  }
}

function StructuredMessage(props) {
  const {children} = props
  return (
    <Box gap='xsmall' {...(props.attributes || {})}>
      {recurse(children)}
    </Box>
  )
}

export default StructuredMessage