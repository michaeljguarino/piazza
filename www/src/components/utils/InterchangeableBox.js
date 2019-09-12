import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {FormPrevious} from 'grommet-icons'
import HoveredBackground from './HoveredBackground'
import TinyCrossfade from "react-tiny-crossfade"
import './crossfade.css'

function ContentWrapper(props) {
  return (
    <Box gap='xsmmall'>
      {props.children}
      <Box pad='xxsmall' border='top'>
        <HoveredBackground>
          <Box
            hoverable
            style={{cursor: 'pointer'}}
            onClick={() => props.setAlternate(null)}
            pad={{vertical: 'xsmall', horizontal: 'small'}}
            direction='row'
            align='center'
            round='xsmall'
            gap='xsmall'>
            <FormPrevious size='15px' />
            <Text size='small'>return to menu</Text>
          </Box>
        </HoveredBackground>
      </Box>
    </Box>
  )
}

function MaybeWrap(props) {
  if (props.noWrap) return props.children
  const {children, ...rest} = props
  return (<ContentWrapper {...rest}>{children}</ContentWrapper>)
}

function InterchangeableBox(props) {
  const [alternate, setAlternate] = useState(null)

  return (
    <TinyCrossfade duration={200} className='crossfade-wrapper' >
      {!alternate ?
        <Box key='original' {...props}>{props.children(setAlternate)}</Box>
        : <MaybeWrap key='alternate' noWrap={props.noWrap} setAlternate={setAlternate}>{alternate}</MaybeWrap>
      }
    </TinyCrossfade>
  )
}

export default InterchangeableBox