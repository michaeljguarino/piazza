import React, {useState, useRef} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Text} from 'grommet'
import {THEME_FIELDS} from './constants'
import Button, {SecondaryButton} from '../utils/Button'
import InputField from '../utils/InputField'
import {chunk} from '../../utils/array'
import {ThemeContext} from '../Theme'
import {ChromePicker} from 'react-color'
import {addTheme} from './utils'
import {CREATE_THEME, THEME_Q} from './queries'
import Popover from 'react-tiny-popover'


function ThemePicker(props) {
  const dropRef = useRef()
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)

  return (
    <Popover 
      isOpen={open} 
      position={['bottom', 'top']}
      onClickOutside={() => setOpen(false)}
      containerStyle={{'z-index': '500'}}
      content={
        <ChromePicker
          disableAlpha
          color={props.color}
          onChangeComplete={(color) => props.onChange(color.hex)}
        />}>
      <Box ref={dropRef} gap='xsmall' width='30%'>
        <Text weight='bold' size='small'>{props.field}</Text>
        <Box direction='row' round='xsmall' border>
          <Box width='100%' pad='xsmall'>
            {props.color}
          </Box>
          <Box
            width='90px'
            background='light-3'
            style={{cursor: 'pointer'}}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            elevation={hover ? 'small' : null}
            border='left'
            pad='xsmall'
            onClick={() => setOpen(true)}>
            Change
          </Box>
        </Box>
      </Box>
    </Popover>
  )
}

function cleanTheme(theme) {
  const {__typename, id, name, ...cleanedTheme} = theme
  return cleanedTheme
}

function ThemeForm(props) {
  const [theme, setTheme] = useState(cleanTheme(props.theme))
  const [name, setName] = useState(null)

  function wrappedSetTheme(fieldName, value) {
    let newTheme = {...theme}
    newTheme[fieldName] = value
    setTheme(newTheme)
  }
  console.log(theme)

  return (
    <Mutation 
      mutation={CREATE_THEME} 
      variables={{name, attributes: theme}}
      update={(cache, {data}) => {
        const prev = cache.readQuery({query: THEME_Q})
        cache.writeQuery({
          query: THEME_Q,
          data: addTheme(prev, data.createTheme)
        })
        props.cancel()
      }}>
    {mutate => (
      <>
      <Box gap='small'>
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
                color={theme[field]}
                field={field} 
                onChange={(value) => wrappedSetTheme(field, value)} />
            ))}
          </Box>
        ))}
      </Box>
      <Box direction='row' margin={{top: 'small'}} gap='xsmall' justify='end'>
        <SecondaryButton round='xsmall' label='Cancel' onClick={() => props.cancel()} />
        <Button round='xsmall' label='Create' onClick={mutate} />
      </Box>
      </>
    )}
    </Mutation>
  )
}

function ThemeCreator(props) {
  return (
    <ThemeContext.Consumer>
    {({brand: {theme}}) => (
      <Box gap='small' width='600px' pad='small'>
        <ThemeForm theme={theme} cancel={props.cancel} />
      </Box>
    )}
    </ThemeContext.Consumer>
  )
}

export default ThemeCreator