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
      <HoveredBackground>
        <Box
          hoverable
          style={{cursor: 'pointer'}}
          onClick={() => props.setAlternate(null)}
          pad={{horizontal: 'xsmall', vertical: 'small'}}
          direction='row'
          border='top'
          align='center'
          gap='xsmall'>
          <FormPrevious size='15px' />
          <Text size='small'>return to menu</Text>
        </Box>
      </HoveredBackground>
    </Box>
  )
}

function InterchangeableBox(props) {
  const [alternate, setAlternate] = useState(null)

  return (
    <TinyCrossfade duration={200} className='crossfade-wrapper' >
      {!alternate ?
        <Box key='original' {...props}>{props.children(setAlternate)}</Box>
        : <ContentWrapper key='alternate' setAlternate={setAlternate}>{alternate}</ContentWrapper>
      }
    </TinyCrossfade>
  )
}

export default InterchangeableBox