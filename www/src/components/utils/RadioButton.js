import React, {useState, useCallback} from 'react'
import {Box, ThemeContext} from 'grommet'
import {normalizeColor} from './colors'

function RadioButton({onChange, ...props}) {
  const [hover, setHover] = useState(false)
  const [enabled, setEnabled] = useState(!!props.enabled)
  const enabledStyle = enabled ? {borderColor: normalizeColor('focus', props.theme)} : {}

  const wrappedSetEnabled = useCallback((enabled) => {
    setEnabled(enabled)
    onChange && onChange(enabled)
  }, [onChange, setEnabled])

  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => wrappedSetEnabled(!enabled)}
      direction='row'
      pad='xsmall'
      border
      round='xsmall'
      align='center'
      gap='xsmall'
      elevation={hover ? 'xsmall' : null}
      style={{cursor: 'pointer', ...enabledStyle}}>
      <Box width='30px' align='center' justify='center'>
        <Box width='21px' height='21px' round='full' align='center' justify='center' border>
          {enabled && <Box width='15px' height='15px' round='full' background='focus' elevation='xsmall' />}
        </Box>
      </Box>
      <Box>
        {props.label}
      </Box>
    </Box>
  )
}

function RadioButtonWrapped(props) {
  return (
    <ThemeContext.Consumer>
    {theme => (
      <RadioButton {...props} theme={theme} />
    )}
    </ThemeContext.Consumer>
  )
}

export default RadioButtonWrapped