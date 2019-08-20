import React from 'react'
import {Box, Text, Markdown, Anchor} from 'grommet'

function video(props, i) {
  const {url, ...rest} = props.attributes
  console.log(props)
  return <video {...rest} src={url} />
}

function box(props, i) {
  const {children, attributes} = props
  return (
    <Box {...attributes}>
      {children.map(parse)}
    </Box>
  )
}

function attachment(props, i) {
  const {children, attributes} = props
  const {accent, ...rest} = attributes || {}
  return (
    <Box border fill='horizontal' background='white'>
      <Box {...rest} style={{
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: accent || 'rgba(35, 137, 215, 0.5)'}}>
        {children.map(parse)}
      </Box>
    </Box>
  )
}

function text(props) {
  const attrs = props.attributes || {}
  const value = attrs.value || props.value
  const {size, ...rest} = attrs
  return (<Text size={size || 'small'} {...rest}>{value}</Text>)
}

function markdown(props) {
  const {value, ...rest} = props.attributes
  return <Markdown {...rest}>{value}</Markdown>
}

function image(props) {
  const {url, ...rest} = props.attributes
  return <img alt={url} {...rest} src={url} />
}

function link(props) {
  const {attributes, children} = props
  return <Anchor {...attributes}>{children.map(parse)}</Anchor>
}

function parse(struct) {
  switch (struct._type) {
    case "box":
      return box(struct)
    case "video":
      return video(struct)
    case "attachment":
      return attachment(struct)
    case "text":
      return text(struct)
    case "markdown":
      return markdown(struct)
    case "image":
      return image(struct)
    case "link":
      return link(struct)
    default:
      return null
  }
}

function StructuredMessage(props) {
  const {children} = props
  return (
    <Box fill='horizontal' gap='xsmall' {...(props.attributes || {})}>
      {children.map(parse)}
    </Box>
  )
}

export default StructuredMessage