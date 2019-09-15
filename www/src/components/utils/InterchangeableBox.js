import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {FormPrevious} from 'grommet-icons'
import HoveredBackground from './HoveredBackground'
import TinyCrossfade from "react-tiny-crossfade"
import {SwitchTransition, CSSTransition} from 'react-transition-group'
import './interbox.css'

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
    <SwitchTransition>
      <CSSTransition key={alternate ? 'alternate' : 'original'} timeout={200} classNames='interbox'>
      {!alternate ?
        <Box {...props}>{props.children(setAlternate)}</Box>
        : <MaybeWrap noWrap={props.noWrap} setAlternate={setAlternate}>{alternate}</MaybeWrap>
      }
      </CSSTransition>
    </SwitchTransition>
  )
}

export default InterchangeableBox