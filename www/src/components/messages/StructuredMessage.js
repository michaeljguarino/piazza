import React, { useContext } from 'react'
import { Mutation} from 'react-apollo'
import { Box, Text, Markdown, Anchor, ThemeContext } from 'grommet'
import { Button, SecondaryButton } from 'forge-core'
import { INTERACTION } from './queries'
import { DialogContext } from './MessageList'
import { normalizeColor } from 'grommet/utils'
import { Icon } from './File'

function recurse(children, theme) {
  if (!children) return null
  return children.map((c, i) => parse(c, i, theme))
}

const toInt = (str) => `${str}`.replace('px', '')

function aspectRatio(width, height) {
  const w = parseInt(width)
  const h = parseInt(height)
  return {w, h, ratio: (w / h)}
}

function video({key, attributes: {url, loop, autoPlay, width, height, ...rest}}) {
  return (
    <video
      style={{maxHeight: '250px'}}
      // width={width || '200px'}
      height={height}
      key={key}
      loop={!!loop}
      autoPlay={!!autoPlay}
      {...rest}
      src={url}
    />
  )
}

const border = ({borderSize, borderSide, border}) => (
  (borderSize || borderSide) ? {side: borderSide, color: border, size: borderSize} : border
)

function box({children, attributes, key}) {
  return (
    <Box key={key} {...(attributes || {})} border={border(attributes)}>
      {recurse(children)}
    </Box>
  )
}

function attachment({children, attributes, key, theme}, i) {

  const {accent, margin, ...rest} = attributes || {}
  return (
    <Box key={key} margin={margin} border background='white'>
      <Box {...rest} style={{
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: accent ? normalizeColor(accent, theme) : 'rgba(35, 137, 215, 0.5)'}}>
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
  return (
    <Anchor key={key} {...attributes}>
      <Text size='small' {...attributes}>{val ? val :  recurse(children)}</Text>
    </Anchor>
  )
}

const thumb = ({attributes: {name, size}, key}) => <Icon key={key} name={name} size={parseInt(size)} />

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

function parse(struct, index, theme) {
  const props = {...struct, key: index, theme}
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
    case "thumb":
      return thumb(props)
    default:
      return null
  }
}

export default React.memo(function StructuredMessage({children, attributes}) {
  const theme = useContext(ThemeContext)
  return (
    <Box gap='xsmall' align='start' {...(attributes || {})}>
      {recurse(children, theme)}
    </Box>
  )
})