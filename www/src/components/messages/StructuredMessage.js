import React from 'react'
import {Box, Text, Markdown, Anchor} from 'grommet'

function video(props) {
  const {url, ...rest} = props.attributes
  return <video key={props.key} {...rest} src={url} />
}

function box(props) {
  const {children, attributes} = props
  return (
    <Box key={props.key} {...attributes}>
      {children.map(parse)}
    </Box>
  )
}

function attachment(props, i) {
  const {children, attributes} = props
  const {accent, ...rest} = attributes || {}
  return (
    <Box key={props.key} border fill='horizontal' background='white'>
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
  return (<Text key={props.key} size={size || 'small'} {...rest}>{value}</Text>)
}

function markdown(props) {
  const {value, ...rest} = props.attributes
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
  const {attributes, children, value} = props
  return <Anchor key={props.key} {...attributes}>{value ? value :  children.map(parse)}</Anchor>
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
    <Box fill='horizontal' gap='xsmall' {...(props.attributes || {})}>
      {children.map(parse)}
    </Box>
  )
}

export default StructuredMessage