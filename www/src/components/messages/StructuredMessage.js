import React from 'react'
import { Mutation} from 'react-apollo'
import { Box, Text, Markdown, Anchor } from 'grommet'
import Button, { SecondaryButton } from '../utils/Button'
import { INTERACTION } from './queries'
import { DialogContext } from './MessageList'

function recurse(children) {
  if (!children) return null
  return children.map(parse)
}

function video({key, attributes: {url, loop, autoPlay, width, height, ...rest}}) {
  return (
    <video
      style={{maxWidth: '250px', maxHeight: '250px'}}
      width={width || '200px'}
      height={height || '250px'}
      key={key}
      loop={!!loop}
      autoPlay={!!autoPlay}
      {...rest}
      src={url}
    />
  )
}

function box({children, attributes, key}) {
  return (
    <Box key={key} {...(attributes || {})}>
      {recurse(children)}
    </Box>
  )
}

function attachment({children, attributes, key}, i) {
  const {accent, margin, ...rest} = attributes || {}
  return (
    <Box key={key} margin={margin} border background='white'>
      <Box {...rest} style={{
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: accent || 'rgba(35, 137, 215, 0.5)'}}>
        {recurse(children)}
      </Box>
    </Box>
  )
}

function text({attributes, value, key}) {
  const attrs = attributes || {}
  const val = attrs.value || value
  const {size, ...rest} = attrs
  return (<Text key={key} size={size || 'small'} {...rest}>{val}</Text>)
}

function markdown({attributes: {value, ...rest}, key}) {
  if (!value) return null

  return (
    <Markdown
      key={key}
      components={{p: {props: {size: 'small', margin: {top: 'xsmall', bottom: 'xsmall'}}}}}
      {...rest}>
      {value}
    </Markdown>
  )
}

function image({key, attributes: {url, width, height, ...rest}}) {
  return <img key={key} alt={url} width={width || '250px'} height={height || '250px'} {...rest} src={url} />
}

function link({value, attributes, children, key}) {
  const val = value || attributes.value
  return <Anchor key={key} {...attributes}>{val ? val :  recurse(children)}</Anchor>
}

function button({attributes: {interaction, payload, ...rest}}) {
  if (interaction) {
    return (
      <DialogContext.Consumer>
      {({setDialog}) => (
        <Mutation
          key={rest.key}
          mutation={INTERACTION}
          variables={{payload, id: interaction}}
          update={() => setDialog(null)}>
          {mutation => (
            buttonComponent({...rest, onClick: mutation})
          )}
        </Mutation>
      )}
      </DialogContext.Consumer>
    )
  }
  return buttonComponent(rest)
}

function buttonComponent({primary, key, ...props}) {
  if (primary) {
    return <Button key={key} round='xsmall' {...props} />
  }

  return <SecondaryButton key={key} round='xsmall' {...props} />
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
    case "button":
      return button(props)
    default:
      return null
  }
}

export default React.memo(function StructuredMessage({children, attributes}) {
  return (
    <Box gap='xsmall' {...(attributes || {})}>
      {recurse(children)}
    </Box>
  )
})