import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { Box, Text, TextInput } from 'grommet'
import { Button, SecondaryButton, InputField } from 'forge-core'
import { THEME_FIELDS, SLACK_THEME_FIELDS, LINK_DEFAULT, BUTTON_DEFAULT } from './constants'
import { chunk } from '../../utils/array'
import { ThemeContext } from '../Workspace'
import { ChromePicker } from 'react-color'
import { addTheme } from './utils'
import { CREATE_THEME, THEME_Q } from './queries'

function ThemePicker({field, active, color, onChange}) {
  return (
    <Box gap='xsmall' width='33%'>
      <Text weight='bold' size='small'>{field}</Text>
      <Box
        align='center'
        direction='row'
        round='xsmall'
        pad='xsmall'
        gap='small'
        border={active ? {color: "focus"} : {color: 'light-6'}}>
        <Box width='100%'>
          {color}
        </Box>
        <Box
          flex={false}
          width='20px'
          height='20px'
          background={color}
          focusIndicator={false}
          onClick={() => onChange(field)} />
      </Box>
    </Box>
  )
}

function cleanTheme(theme) {
  const {__typename, id, name, ...cleanedTheme} = theme
  return cleanedTheme
}

function serializeTheme(theme) {
  return THEME_FIELDS.map((field) => theme[field]).join(",")
}

function serializeSlack(theme) {
  return SLACK_THEME_FIELDS.map((field) => theme[field]).join(",")
}

function deserializeTheme(serialized, theme) {
  return serialized.split(",").reduce((theme, val, i) => {
    theme[THEME_FIELDS[i]] = val
    return theme
  }, {...theme})
}

function deserializeSlack(serialized, theme) {
  let newTheme = serialized.split(",").reduce((theme, val, i) => {
    theme[SLACK_THEME_FIELDS[i]] = val
    return theme
  }, {...theme})
  const {sidebar, sidebarHover} = newTheme

  return {
    ...newTheme,
    brand: sidebar, action: BUTTON_DEFAULT, actionHover: BUTTON_DEFAULT,
    tagLight: sidebarHover, tagMedium: sidebar, link: LINK_DEFAULT
  }
}

function ThemeForm({theme, cancel}) {
  const [themeAttrs, setThemeAttrs] = useState(cleanTheme(theme))
  const [active, setActive] = useState('brand')
  const [name, setName] = useState(theme.name || '')
  const [mutation] = useMutation(CREATE_THEME, {
    variables: {name, attributes: theme},
    update: (cache, {data}) => {
      const prev = cache.readQuery({query: THEME_Q})
      cache.writeQuery({
        query: THEME_Q,
        data: addTheme(prev, data.createTheme)
      })
      cancel()
    }
  })

  function wrappedSetTheme(fieldName, value) {
    setThemeAttrs({...themeAttrs, [fieldName]: value})
  }

  return (
    <>
    <Box direction='row' gap='small'>
      <Box gap='small' width='100%' pad={{right: 'small'}}>
        <InputField
          label='name'
          value={name}
          placehoder='my-theme-name'
          onChange={(e) => setName(e.target.value)} />
        {Array.from(chunk(THEME_FIELDS, 3)).map((fieldChunk, ind) => (
          <Box key={ind} direction='row' gap='small'>
            {fieldChunk.map((field) => (
              <ThemePicker
                key={field}
                color={themeAttrs[field]}
                field={field}
                active={field === active}
                onChange={(value) => setActive(value)} />
            ))}
          </Box>
        ))}
        <Box margin={{top: 'small'}}>
          <TextInput
            value={serializeTheme(theme)}
            onChange={(e) => {
              const deserialized = deserializeTheme(e.target.value, theme)
              setThemeAttrs(deserialized)
            }} />
        </Box>
        <Box margin={{top: 'small'}} gap='small' direction='row'>
          <Text size='small' weight='bold'>Import from slack</Text>
          <TextInput
            value={serializeSlack(theme)}
            onChange={(e) => {
              const deserialized = deserializeSlack(e.target.value, theme)
              setThemeAttrs(deserialized)
            }} />
        </Box>
      </Box>
      <ChromePicker
        disableAlpha
        color={themeAttrs[active]}
        onChangeComplete={(color) => wrappedSetTheme(active, color.hex)}
      />
    </Box>
    <Box direction='row' margin={{top: 'small'}} gap='xsmall' justify='end'>
      <SecondaryButton round='xsmall' label='Cancel' onClick={() => cancel()} />
      <Button round='xsmall' label='Create' onClick={mutation} />
    </Box>
    </>
  )
}

export default function ThemeCreator({cancel}) {
  return (
    <ThemeContext.Consumer>
    {({brand: {theme}}) => (
      <Box gap='small' width='720px' pad='small'>
        <ThemeForm theme={theme} cancel={cancel} />
      </Box>
    )}
    </ThemeContext.Consumer>
  )
}